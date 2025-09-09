import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gujarat_real_estate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  return await pool.connect();
}

export async function initDatabase() {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_reg_id VARCHAR(255) UNIQUE,
        project_name TEXT,
        promoter_name TEXT,
        project_type VARCHAR(255),
        project_status VARCHAR(100),
        district_name VARCHAR(255),
        reg_no VARCHAR(255),
        approved_on DATE,
        start_date DATE,
        end_date DATE,
        project_cost DECIMAL(15,2),
        project_address TEXT,
        pmtr_email_id VARCHAR(255),
        pr_mobile_no VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS city_stats (
        id SERIAL PRIMARY KEY,
        city_name VARCHAR(255) UNIQUE,
        project_count INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS fetch_history (
        id SERIAL PRIMARY KEY,
        fetch_type VARCHAR(100),
        total_projects INTEGER,
        success BOOLEAN,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_name);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_promoter ON projects(promoter_name);`);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function saveProjects(projects: any[]) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    for (const project of projects) {
      await client.query(`
        INSERT INTO projects (
          project_reg_id, project_name, promoter_name, project_type,
          project_status, district_name, reg_no, approved_on,
          start_date, end_date, project_cost, project_address,
          pmtr_email_id, pr_mobile_no, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
        ON CONFLICT (project_reg_id) 
        DO UPDATE SET 
          project_name = EXCLUDED.project_name,
          promoter_name = EXCLUDED.promoter_name,
          project_type = EXCLUDED.project_type,
          project_status = EXCLUDED.project_status,
          district_name = EXCLUDED.district_name,
          reg_no = EXCLUDED.reg_no,
          approved_on = EXCLUDED.approved_on,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          project_cost = EXCLUDED.project_cost,
          project_address = EXCLUDED.project_address,
          pmtr_email_id = EXCLUDED.pmtr_email_id,
          pr_mobile_no = EXCLUDED.pr_mobile_no,
          updated_at = CURRENT_TIMESTAMP
      `, [
        project.projectRegId,
        project.projectName,
        project.promoterName,
        project.projectType,
        project.project_status,
        project.districtName,
        project.regNo,
        project.approvedOn || null,
        project.startDate || null,
        project.endDate || null,
        parseFloat(project.total_est_cost_of_proj || project.projectCost || '0'),
        project.project_address,
        project.pmtr_email_id,
        project.pr_mobile_no
      ]);
    }
    
    await client.query('COMMIT');
    console.log(`Saved ${projects.length} projects to database`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving projects:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateCityStats() {
  try {
    // Get city-wise counts
    const result = await query(`
      SELECT district_name as city_name, COUNT(*) as project_count
      FROM projects
      WHERE district_name IS NOT NULL
      GROUP BY district_name
    `);

    for (const row of result.rows) {
      await query(`
        INSERT INTO city_stats (city_name, project_count, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (city_name)
        DO UPDATE SET 
          project_count = EXCLUDED.project_count,
          updated_at = CURRENT_TIMESTAMP
      `, [row.city_name, row.project_count]);
    }
    
    console.log('City stats updated');
  } catch (error) {
    console.error('Error updating city stats:', error);
    throw error;
  }
}

export async function getCityStats() {
  const result = await query(`
    SELECT city_name, project_count
    FROM city_stats
    ORDER BY project_count DESC
  `);
  return result.rows;
}

export async function getProjectStats() {
  const result = await query(`
    SELECT 
      COUNT(*) as total_projects,
      SUM(CASE WHEN project_status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing_projects,
      SUM(CASE WHEN project_status = 'Completed' THEN 1 ELSE 0 END) as completed_projects,
      SUM(CASE WHEN project_status = 'New' THEN 1 ELSE 0 END) as new_projects,
      SUM(project_cost) as total_value
    FROM projects
  `);
  return result.rows[0];
}

export async function getRecentProjects(limit: number = 10) {
  const result = await query(`
    SELECT 
      project_name as "projectName",
      promoter_name as "promoterName",
      project_type as "projectType",
      district_name as district,
      reg_no as "reraId",
      approved_on as "approvedOn",
      project_status as status,
      project_cost as "projectCost"
    FROM projects
    ORDER BY approved_on DESC NULLS LAST
    LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function getTopDevelopers(limit: number = 10) {
  const result = await query(`
    SELECT 
      promoter_name as name,
      COUNT(*) as "projectCount"
    FROM projects
    WHERE promoter_name IS NOT NULL AND promoter_name != ''
    GROUP BY promoter_name
    ORDER BY "projectCount" DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function getProjectsByCity(city: string) {
  const result = await query(`
    SELECT 
      project_reg_id as id,
      project_name as name,
      promoter_name as developer,
      project_type as type,
      project_status as status,
      project_address as location,
      district_name as city,
      reg_no as "registrationNo",
      approved_on as "approvedDate",
      start_date as "startDate",
      end_date as "completionDate",
      project_cost as "projectCost",
      pmtr_email_id as email,
      pr_mobile_no as phone
    FROM projects
    WHERE LOWER(district_name) = LOWER($1)
    ORDER BY approved_on DESC NULLS LAST
  `, [city]);
  return result.rows;
}

export async function recordFetch(fetchType: string, totalProjects: number, success: boolean) {
  await query(
    'INSERT INTO fetch_history (fetch_type, total_projects, success) VALUES ($1, $2, $3)',
    [fetchType, totalProjects, success]
  );
}

export default pool;