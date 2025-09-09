import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'rera-projects.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_reg_id TEXT UNIQUE,
        project_name TEXT,
        promoter_name TEXT,
        project_type TEXT,
        project_status TEXT,
        district_name TEXT,
        reg_no TEXT,
        approved_on TEXT,
        start_date TEXT,
        end_date TEXT,
        project_cost REAL,
        project_address TEXT,
        pmtr_email_id TEXT,
        pr_mobile_no TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS city_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_name TEXT UNIQUE,
        project_count INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fetch_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fetch_type TEXT,
        total_projects INTEGER,
        success BOOLEAN,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_name);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);
      CREATE INDEX IF NOT EXISTS idx_projects_promoter ON projects(promoter_name);
    `);
  }

  return db;
}

export async function saveProjects(projects: any[]) {
  const db = await getDb();
  
  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO projects (
      project_reg_id, project_name, promoter_name, project_type,
      project_status, district_name, reg_no, approved_on,
      start_date, end_date, project_cost, project_address,
      pmtr_email_id, pr_mobile_no, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const project of projects) {
    await stmt.run(
      project.projectRegId,
      project.projectName,
      project.promoterName,
      project.projectType,
      project.project_status,
      project.districtName,
      project.regNo,
      project.approvedOn,
      project.startDate,
      project.endDate,
      parseFloat(project.total_est_cost_of_proj || project.projectCost || '0'),
      project.project_address,
      project.pmtr_email_id,
      project.pr_mobile_no
    );
  }

  await stmt.finalize();
}

export async function updateCityStats() {
  const db = await getDb();
  
  // Get city-wise counts
  const stats = await db.all(`
    SELECT district_name as city_name, COUNT(*) as project_count
    FROM projects
    WHERE district_name IS NOT NULL
    GROUP BY district_name
  `);

  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO city_stats (city_name, project_count, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  for (const stat of stats) {
    await stmt.run(stat.city_name, stat.project_count);
  }

  await stmt.finalize();
}

export async function getCityStats() {
  const db = await getDb();
  return await db.all(`
    SELECT city_name, project_count
    FROM city_stats
    ORDER BY project_count DESC
  `);
}

export async function getProjectStats() {
  const db = await getDb();
  
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total_projects,
      SUM(CASE WHEN project_status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing_projects,
      SUM(CASE WHEN project_status = 'Completed' THEN 1 ELSE 0 END) as completed_projects,
      SUM(CASE WHEN project_status = 'New' THEN 1 ELSE 0 END) as new_projects,
      SUM(project_cost) as total_value
    FROM projects
  `);

  return stats;
}

export async function getRecentProjects(limit: number = 10) {
  const db = await getDb();
  return await db.all(`
    SELECT 
      project_name as projectName,
      promoter_name as promoterName,
      project_type as projectType,
      district_name as district,
      reg_no as reraId,
      approved_on as approvedOn,
      project_status as status,
      project_cost as projectCost
    FROM projects
    ORDER BY approved_on DESC
    LIMIT ?
  `, limit);
}

export async function getTopDevelopers(limit: number = 10) {
  const db = await getDb();
  return await db.all(`
    SELECT 
      promoter_name as name,
      COUNT(*) as projectCount
    FROM projects
    WHERE promoter_name IS NOT NULL AND promoter_name != ''
    GROUP BY promoter_name
    ORDER BY projectCount DESC
    LIMIT ?
  `, limit);
}

export async function getProjectsByCity(city: string) {
  const db = await getDb();
  return await db.all(`
    SELECT 
      project_reg_id as id,
      project_name as name,
      promoter_name as developer,
      project_type as type,
      project_status as status,
      project_address as location,
      district_name as city,
      reg_no as registrationNo,
      approved_on as approvedDate,
      start_date as startDate,
      end_date as completionDate,
      project_cost as projectCost,
      pmtr_email_id as email,
      pr_mobile_no as phone
    FROM projects
    WHERE LOWER(district_name) = LOWER(?)
    ORDER BY approved_on DESC
  `, city);
}

export async function recordFetch(fetchType: string, totalProjects: number, success: boolean) {
  const db = await getDb();
  await db.run(
    'INSERT INTO fetch_history (fetch_type, total_projects, success) VALUES (?, ?, ?)',
    fetchType, totalProjects, success
  );
}