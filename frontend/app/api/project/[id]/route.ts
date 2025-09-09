import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get project details from PostgreSQL
    const projectResult = await query(`
      SELECT 
        rera_project_id as id,
        project_name as name,
        metadata->>'promoterName' as developer,
        project_type as type,
        project_status as status,
        address as location,
        city,
        district,
        rera_project_id as "registrationNo",
        rera_approval_date as "approvedDate",
        project_start_date as "startDate",
        project_completion_date as "completionDate",
        total_project_cost as "projectCost",
        metadata->>'pmtrEmailId' as email,
        metadata->>'prMobileNo' as phone,
        project_description as description,
        total_area_sqmt as "totalArea",
        total_units as "totalUnits",
        total_buildings as "totalBuildings",
        metadata
      FROM projects
      WHERE rera_project_id = $1 OR id::text = $1
      LIMIT 1
    `, [id]);
    
    if (projectResult.rows && projectResult.rows.length > 0) {
      const project = projectResult.rows[0];
      
      // Get related projects from same developer
      const relatedProjects = await query(`
        SELECT 
          rera_project_id as id,
          project_name as name,
          project_type as type,
          project_status as status,
          city,
          total_project_cost as "projectCost"
        FROM projects
        WHERE metadata->>'promoterName' = $1
          AND rera_project_id != $2
        ORDER BY created_at DESC
        LIMIT 5
      `, [project.developer, id]);
      
      // Get nearby projects in same city
      const nearbyProjects = await query(`
        SELECT 
          rera_project_id as id,
          project_name as name,
          metadata->>'promoterName' as developer,
          project_type as type,
          project_status as status,
          total_project_cost as "projectCost"
        FROM projects
        WHERE city = $1
          AND rera_project_id != $2
        ORDER BY created_at DESC
        LIMIT 5
      `, [project.city, id]);
      
      return NextResponse.json({
        success: true,
        project: {
          ...project,
          projectCost: parseFloat(project.projectCost) || 0,
          contact: {
            email: project.email,
            phone: project.phone
          },
          relatedProjects: relatedProjects.rows,
          nearbyProjects: nearbyProjects.rows
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Project not found'
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error fetching project details:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch project details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}