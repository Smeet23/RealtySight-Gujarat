import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET(_request: NextRequest) {
  try {
    // Get statistics from PostgreSQL
    const projectStats = await query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN project_status = 'Ongoing' THEN 1 END) as ongoing_projects,
        COUNT(CASE WHEN project_status = 'Completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN project_status = 'New' THEN 1 END) as new_projects,
        SUM(total_project_cost) as total_value
      FROM projects
    `);
    
    // Get city-wise distribution
    const cityStats = await query(`
      SELECT 
        city,
        COUNT(*) as count
      FROM projects
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
    `);
    
    // Get recent projects
    const recentProjects = await query(`
      SELECT 
        project_name as "projectName",
        metadata->>'promoterName' as "promoterName",
        project_type as "projectType",
        city as district,
        rera_project_id as "reraId",
        rera_approval_date as "approvedOn",
        project_status as status,
        total_project_cost as "projectCost"
      FROM projects
      WHERE project_name IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    // Get top developers
    const topDevelopers = await query(`
      SELECT 
        metadata->>'promoterName' as name,
        COUNT(*) as "projectCount"
      FROM projects
      WHERE metadata->>'promoterName' IS NOT NULL 
        AND metadata->>'promoterName' != 'Unknown'
        AND metadata->>'promoterName' != ''
      GROUP BY metadata->>'promoterName'
      ORDER BY "projectCount" DESC
      LIMIT 10
    `);
    
    // Convert city stats to object format
    const cityStatsObj: Record<string, number> = {};
    cityStats.rows.forEach((row: any) => {
      cityStatsObj[row.city] = parseInt(row.count);
    });
    
    const stats = projectStats.rows[0];
    
    return NextResponse.json({
      success: true,
      totalProjects: parseInt(stats?.total_projects || '0'),
      ongoingProjects: parseInt(stats?.ongoing_projects || '0'),
      completedProjects: parseInt(stats?.completed_projects || '0'),
      newProjects: parseInt(stats?.new_projects || '0'),
      totalValue: parseFloat(stats?.total_value || '0'),
      cityStats: cityStatsObj,
      recentProjects: recentProjects.rows,
      topDevelopers: topDevelopers.rows.map((d: any) => ({
        name: d.name,
        projectCount: parseInt(d.projectCount)
      })),
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}