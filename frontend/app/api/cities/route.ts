import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET(_request: NextRequest) {
  try {
    // Get city-wise statistics
    const cityData = await query(`
      SELECT 
        city,
        COUNT(*) as count,
        COUNT(CASE WHEN project_status = 'Ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN project_status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN project_status = 'New' THEN 1 END) as new,
        SUM(COALESCE(total_project_cost, 0)) as total_value,
        MIN(project_start_date) as earliest_project,
        MAX(project_completion_date) as latest_project,
        COUNT(DISTINCT metadata->>'promoterName') as unique_developers
      FROM projects
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
    `);

    const cities = cityData.rows.map((row: any) => ({
      city: row.city,
      count: parseInt(row.count),
      ongoing: parseInt(row.ongoing),
      completed: parseInt(row.completed),
      new: parseInt(row.new),
      totalValue: parseFloat(row.total_value || '0'),
      earliestProject: row.earliest_project,
      latestProject: row.latest_project,
      uniqueDevelopers: parseInt(row.unique_developers)
    }));

    return NextResponse.json({
      success: true,
      cities,
      totalCities: cities.length,
      totalProjects: cities.reduce((sum: number, c: any) => sum + c.count, 0)
    });
    
  } catch (error) {
    console.error('Error fetching cities data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cities data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}