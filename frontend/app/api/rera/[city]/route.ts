import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    
    // Get projects for the city from PostgreSQL
    const projects = await query(`
      SELECT 
        rera_project_id as id,
        project_name as name,
        metadata->>'promoterName' as developer,
        project_type as type,
        project_status as status,
        address as location,
        city,
        rera_project_id as "registrationNo",
        rera_approval_date as "approvedDate",
        project_start_date as "startDate",
        project_completion_date as "completionDate",
        total_project_cost as "projectCost",
        metadata->>'pmtrEmailId' as email,
        metadata->>'prMobileNo' as phone
      FROM projects
      WHERE LOWER(city) = LOWER($1)
      ORDER BY created_at DESC
    `, [city]);
    
    if (projects.rows && projects.rows.length > 0) {
      // Calculate statistics
      const stats = {
        total: projects.rows.length,
        ongoing: projects.rows.filter((p: any) => p.status === 'Ongoing').length,
        completed: projects.rows.filter((p: any) => p.status === 'Completed').length,
        new: projects.rows.filter((p: any) => p.status === 'New').length,
        residential: projects.rows.filter((p: any) => p.type === 'Residential').length,
        commercial: projects.rows.filter((p: any) => p.type === 'Commercial').length,
        mixed: projects.rows.filter((p: any) => p.type === 'Mixed').length,
        totalValue: projects.rows.reduce((sum: number, p: any) => sum + (parseFloat(p.projectCost) || 0), 0)
      };

      // Format contact info
      const formattedProjects = projects.rows.map((p: any) => ({
        ...p,
        projectCost: parseFloat(p.projectCost) || 0,
        contact: {
          email: p.email,
          phone: p.phone
        }
      }));

      return NextResponse.json({
        success: true,
        city,
        stats,
        projects: formattedProjects,
        totalCount: projects.rows.length,
        fetchedAt: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      city,
      stats: {
        total: 0,
        ongoing: 0,
        completed: 0,
        new: 0,
        residential: 0,
        commercial: 0,
        mixed: 0,
        totalValue: 0
      },
      projects: [],
      totalCount: 0,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching city data:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch city data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}