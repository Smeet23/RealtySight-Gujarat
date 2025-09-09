const { Pool } = require('pg');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'gujarat_real_estate',
  user: 'postgres',
  password: 'postgres123',
});

// Cities to fetch data from
const GUJARAT_CITIES = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Gandhinagar',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
  'Anand',
  'Navsari',
  'Morbi',
  'Mehsana',
  'Bharuch',
  'Porbandar',
  'Valsad',
  'Vapi',
  'Veraval',
  'Palanpur',
  'Patan',
  'Botad'
];

// Function to fetch data using curl
async function fetchReraDataWithCurl(city) {
  try {
    const url = `https://gujrera.gujarat.gov.in/dashboard/get-district-wise-projectlist/0/0/all/${city}/all`;
    console.log(`Fetching URL: ${url}`);
    
    const { stdout } = await execPromise(`curl -k -s "${url}"`, { 
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });
    
    const data = JSON.parse(stdout);
    if (data.status === '200' && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error(`Curl error for ${city}:`, error.message);
    return [];
  }
}

// Function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === '') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

// Function to parse number
function parseNumber(value) {
  if (!value || value === 'null' || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Main function to fetch and store data
async function fetchAndStoreAllData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting RERA data import using curl...\n');
    
    // First, update the constraints to allow more project types and statuses
    await client.query(`
      ALTER TABLE projects 
      DROP CONSTRAINT IF EXISTS projects_project_type_check,
      DROP CONSTRAINT IF EXISTS projects_project_status_check
    `);
    
    await client.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT projects_project_type_check 
      CHECK (project_type IN ('Residential', 'Commercial', 'Mixed', 'Plotted', 'Residential/Group Housing', 
                              'Mixed Development', 'Township', 'Other', 'Residential Apartment', 
                              'Residential Villa', 'Residential Plot', 'Commercial Shop', 
                              'Commercial Office', 'Commercial Complex'))
    `);
    
    await client.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT projects_project_status_check 
      CHECK (project_status IN ('New', 'Ongoing', 'Completed', 'Delayed', 'Stalled', 'Lapsed', 'Other', 
                                'Under Construction', 'Ready to Move', 'Pre Launch'))
    `);
    
    let totalProjects = 0;
    let successfulCities = 0;
    let cityProjectCounts = {};
    
    for (const city of GUJARAT_CITIES) {
      try {
        console.log(`Fetching data for ${city}...`);
        const projects = await fetchReraDataWithCurl(city);
        
        if (projects.length === 0) {
          console.log(`No projects found for ${city}\n`);
          continue;
        }
        
        console.log(`Found ${projects.length} projects for ${city}`);
        successfulCities++;
        cityProjectCounts[city] = 0;
        
        for (const project of projects) {
          try {
            // Generate unique RERA ID
            const reraProjectId = project.regNo || project.projectRegId || 
                                 `${city}_${project.projectName}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, '_');
            
            const projectName = project.projectName || 'Unnamed Project';
            const cityName = project.districtName || city;
            
            // Map project type
            let projectType = 'Residential'; // Default
            if (project.projectType) {
              const typeStr = project.projectType.toLowerCase();
              if (typeStr.includes('commercial')) projectType = 'Commercial';
              else if (typeStr.includes('mixed')) projectType = 'Mixed';
              else if (typeStr.includes('plot')) projectType = 'Plotted';
              else if (typeStr.includes('township')) projectType = 'Township';
              else if (typeStr.includes('villa')) projectType = 'Residential';
              else if (typeStr.includes('apartment')) projectType = 'Residential';
              else if (typeStr.includes('residential')) projectType = 'Residential';
              else projectType = 'Other';
            }
            
            // Map project status
            let projectStatus = 'Ongoing'; // Default
            if (project.project_status) {
              const statusStr = project.project_status.toLowerCase();
              if (statusStr.includes('new')) projectStatus = 'New';
              else if (statusStr.includes('ongoing')) projectStatus = 'Ongoing';
              else if (statusStr.includes('complete')) projectStatus = 'Completed';
              else if (statusStr.includes('delay')) projectStatus = 'Delayed';
              else if (statusStr.includes('stall')) projectStatus = 'Stalled';
              else if (statusStr.includes('lapse')) projectStatus = 'Lapsed';
              else if (statusStr.includes('under construction')) projectStatus = 'Ongoing';
              else projectStatus = 'Other';
            }
            
            const query = `
              INSERT INTO projects (
                rera_project_id,
                project_name,
                project_description,
                project_type,
                project_status,
                address,
                locality,
                city,
                district,
                project_start_date,
                project_completion_date,
                total_project_cost,
                rera_approval_date,
                metadata
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              ON CONFLICT (rera_project_id) 
              DO UPDATE SET
                project_name = EXCLUDED.project_name,
                project_type = EXCLUDED.project_type,
                project_status = EXCLUDED.project_status,
                address = EXCLUDED.address,
                city = EXCLUDED.city,
                district = EXCLUDED.district,
                total_project_cost = EXCLUDED.total_project_cost,
                metadata = EXCLUDED.metadata,
                updated_at = CURRENT_TIMESTAMP
            `;
            
            const values = [
              reraProjectId,
              projectName,
              project.projectDescription || `${projectName} - ${projectType} project in ${cityName}`,
              projectType,
              projectStatus,
              project.project_address || project.projectAddress || `${cityName}, Gujarat`,
              project.locality || null,
              cityName,
              cityName,
              parseDate(project.startDate),
              parseDate(project.endDate || project.completionDate),
              parseNumber(project.total_est_cost_of_proj || project.projectCost || '0'),
              parseDate(project.approvedOn),
              JSON.stringify({
                promoterName: project.promoterName || 'Unknown',
                pmtrEmailId: project.pmtr_email_id,
                prMobileNo: project.pr_mobile_no,
                registrationNo: project.regNo,
                originalProjectType: project.projectType,
                originalStatus: project.project_status,
                fetchedFrom: city,
                fetchedAt: new Date().toISOString()
              })
            ];
            
            await client.query(query, values);
            totalProjects++;
            cityProjectCounts[city]++;
            
          } catch (projectError) {
            console.error(`Error inserting project "${project.projectName}":`, projectError.message);
          }
        }
        
        console.log(`Successfully imported ${cityProjectCounts[city]} projects from ${city}\n`);
        
      } catch (cityError) {
        console.error(`Error processing ${city}:`, cityError.message, '\n');
      }
      
      // Add delay between cities to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('=== Import Complete ===');
    console.log(`${'='.repeat(50)}`);
    console.log(`Total projects imported: ${totalProjects}`);
    console.log(`Successful cities: ${successfulCities}/${GUJARAT_CITIES.length}`);
    
    console.log('\nProjects per city:');
    for (const [city, count] of Object.entries(cityProjectCounts)) {
      if (count > 0) {
        console.log(`  ${city}: ${count} projects`);
      }
    }
    
    // Get summary stats
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT project_type) as types,
        COUNT(DISTINCT project_status) as statuses,
        MIN(project_start_date) as earliest_project,
        MAX(project_completion_date) as latest_completion
      FROM projects
    `);
    
    const typeStats = await client.query(`
      SELECT project_type, COUNT(*) as count
      FROM projects
      GROUP BY project_type
      ORDER BY count DESC
    `);
    
    const statusStats = await client.query(`
      SELECT project_status, COUNT(*) as count
      FROM projects
      GROUP BY project_status
      ORDER BY count DESC
    `);
    
    console.log('\n=== Database Statistics ===');
    console.log(`Total Projects: ${stats.rows[0].total}`);
    console.log(`Cities: ${stats.rows[0].cities}`);
    console.log(`Project Types: ${stats.rows[0].types}`);
    console.log(`Project Statuses: ${stats.rows[0].statuses}`);
    
    if (stats.rows[0].earliest_project) {
      console.log(`Earliest Project: ${stats.rows[0].earliest_project}`);
      console.log(`Latest Completion: ${stats.rows[0].latest_completion}`);
    }
    
    console.log('\nProjects by Type:');
    for (const row of typeStats.rows) {
      console.log(`  ${row.project_type}: ${row.count}`);
    }
    
    console.log('\nProjects by Status:');
    for (const row of statusStats.rows) {
      console.log(`  ${row.project_status}: ${row.count}`);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
console.log('RERA Data Fetcher - Using CURL\n');
console.log('This will fetch real project data from Gujarat RERA portal');
console.log('and store it in your PostgreSQL database.\n');

fetchAndStoreAllData()
  .then(() => {
    console.log('\nScript completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });