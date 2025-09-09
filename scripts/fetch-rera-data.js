const { Pool } = require('pg');
const https = require('https');

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

// Function to fetch data from RERA API
function fetchReraData(city) {
  return new Promise((resolve, reject) => {
    const url = `https://gujrera.gujarat.gov.in/dashboard/get-district-wise-projectlist/0/0/all/${city}/all`;
    
    const options = {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      rejectUnauthorized: false
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === '200' && parsed.data) {
            resolve(parsed.data);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
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

// Function to determine project type
function getProjectType(typeStr) {
  if (!typeStr) return 'Residential';
  const type = typeStr.toLowerCase();
  if (type.includes('commercial')) return 'Commercial';
  if (type.includes('mixed')) return 'Mixed';
  if (type.includes('plot')) return 'Plotted';
  return 'Residential';
}

// Function to determine project status
function getProjectStatus(statusStr) {
  if (!statusStr) return 'Ongoing';
  const status = statusStr.toLowerCase();
  if (status.includes('new')) return 'New';
  if (status.includes('complete')) return 'Completed';
  if (status.includes('delay')) return 'Delayed';
  if (status.includes('stall')) return 'Stalled';
  return 'Ongoing';
}

// Main function to fetch and store data
async function fetchAndStoreAllData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting RERA data import...');
    
    // First, relax the constraints temporarily
    await client.query(`
      ALTER TABLE projects 
      DROP CONSTRAINT IF EXISTS projects_project_type_check,
      DROP CONSTRAINT IF EXISTS projects_project_status_check
    `);
    
    // Add new constraints with more options
    await client.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT projects_project_type_check 
      CHECK (project_type IN ('Residential', 'Commercial', 'Mixed', 'Plotted', 'Residential/Group Housing', 'Mixed Development', 'Township', 'Other'))
    `);
    
    await client.query(`
      ALTER TABLE projects 
      ADD CONSTRAINT projects_project_status_check 
      CHECK (project_status IN ('New', 'Ongoing', 'Completed', 'Delayed', 'Stalled', 'Lapsed', 'Other'))
    `);
    
    let totalProjects = 0;
    let successfulCities = 0;
    
    for (const city of GUJARAT_CITIES) {
      try {
        console.log(`\nFetching data for ${city}...`);
        const projects = await fetchReraData(city);
        
        if (projects.length === 0) {
          console.log(`No projects found for ${city}`);
          continue;
        }
        
        console.log(`Found ${projects.length} projects for ${city}`);
        successfulCities++;
        
        for (const project of projects) {
          try {
            // Map RERA data to our database schema
            const reraProjectId = project.regNo || project.projectRegId || `RERA_${Date.now()}_${Math.random()}`;
            const projectName = project.projectName || 'Unnamed Project';
            const city_name = project.districtName || city;
            
            // Determine project type and status
            let projectType = project.projectType || 'Residential';
            if (!['Residential', 'Commercial', 'Mixed', 'Plotted', 'Residential/Group Housing', 'Mixed Development', 'Township', 'Other'].includes(projectType)) {
              if (projectType.includes('Residential')) projectType = 'Residential/Group Housing';
              else if (projectType.includes('Commercial')) projectType = 'Commercial';
              else if (projectType.includes('Mixed')) projectType = 'Mixed Development';
              else if (projectType.includes('Plot')) projectType = 'Plotted';
              else if (projectType.includes('Township')) projectType = 'Township';
              else projectType = 'Other';
            }
            
            let projectStatus = project.project_status || 'Ongoing';
            if (!['New', 'Ongoing', 'Completed', 'Delayed', 'Stalled', 'Lapsed', 'Other'].includes(projectStatus)) {
              if (projectStatus.toLowerCase().includes('new')) projectStatus = 'New';
              else if (projectStatus.toLowerCase().includes('ongoing')) projectStatus = 'Ongoing';
              else if (projectStatus.toLowerCase().includes('complete')) projectStatus = 'Completed';
              else if (projectStatus.toLowerCase().includes('delay')) projectStatus = 'Delayed';
              else if (projectStatus.toLowerCase().includes('lapse')) projectStatus = 'Lapsed';
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
                updated_at = CURRENT_TIMESTAMP
            `;
            
            const values = [
              reraProjectId,
              projectName,
              project.projectDescription || null,
              projectType,
              projectStatus,
              project.project_address || project.projectAddress || null,
              project.locality || null,
              city_name,
              city_name,
              parseDate(project.startDate),
              parseDate(project.endDate || project.completionDate),
              parseNumber(project.total_est_cost_of_proj || project.projectCost),
              parseDate(project.approvedOn),
              JSON.stringify({
                promoterName: project.promoterName,
                pmtrEmailId: project.pmtr_email_id,
                prMobileNo: project.pr_mobile_no,
                originalData: project
              })
            ];
            
            await client.query(query, values);
            totalProjects++;
            
          } catch (projectError) {
            console.error(`Error inserting project ${project.projectName}:`, projectError.message);
          }
        }
        
      } catch (cityError) {
        console.error(`Error fetching data for ${city}:`, cityError.message);
      }
      
      // Add delay between cities to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n=== Import Complete ===`);
    console.log(`Total projects imported: ${totalProjects}`);
    console.log(`Successful cities: ${successfulCities}/${GUJARAT_CITIES.length}`);
    
    // Get summary stats
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT project_type) as types,
        COUNT(DISTINCT project_status) as statuses
      FROM projects
    `);
    
    console.log('\nDatabase Statistics:');
    console.log(`Total Projects: ${stats.rows[0].total}`);
    console.log(`Cities: ${stats.rows[0].cities}`);
    console.log(`Project Types: ${stats.rows[0].types}`);
    console.log(`Project Statuses: ${stats.rows[0].statuses}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
fetchAndStoreAllData().catch(console.error);