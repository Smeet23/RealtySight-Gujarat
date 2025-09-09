import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    
    // 1. Overall Market Statistics
    const marketStats = await query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(DISTINCT city) as total_cities,
        COUNT(DISTINCT metadata->>'promoterName') as total_developers,
        SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
        AVG(CAST(total_project_cost AS NUMERIC)) as avg_project_cost,
        SUM(total_units) as total_units_in_market,
        SUM(total_area_sqmt) as total_area_developed,
        
        -- Status breakdown
        SUM(CASE WHEN project_status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing_projects,
        SUM(CASE WHEN project_status = 'Completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN project_status = 'New' THEN 1 ELSE 0 END) as new_projects,
        
        -- Type breakdown
        SUM(CASE WHEN project_type = 'Residential' THEN 1 ELSE 0 END) as residential_projects,
        SUM(CASE WHEN project_type = 'Commercial' THEN 1 ELSE 0 END) as commercial_projects,
        SUM(CASE WHEN project_type = 'Mixed' THEN 1 ELSE 0 END) as mixed_projects,
        SUM(CASE WHEN project_type = 'Plotted' THEN 1 ELSE 0 END) as plotted_projects
      FROM projects
      ${city ? "WHERE LOWER(city) = LOWER($1)" : ""}
    `, city ? [city] : []);

    // 2. City-wise Distribution
    const cityDistribution = await query(`
      SELECT 
        city,
        COUNT(*) as project_count,
        SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
        AVG(CAST(total_project_cost AS NUMERIC)) as avg_project_cost,
        SUM(total_units) as total_units,
        SUM(CASE WHEN project_status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing_count,
        SUM(CASE WHEN project_status = 'New' THEN 1 ELSE 0 END) as new_count
      FROM projects
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY project_count DESC
      LIMIT 10
    `);

    // 3. Top Developers by Project Count
    const topDevelopers = await query(`
      SELECT 
        metadata->>'promoterName' as developer_name,
        COUNT(*) as project_count,
        SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
        AVG(CAST(total_project_cost AS NUMERIC)) as avg_project_value,
        SUM(total_units) as total_units,
        COUNT(DISTINCT city) as cities_present,
        STRING_AGG(DISTINCT project_type, ', ') as project_types
      FROM projects
      WHERE metadata->>'promoterName' IS NOT NULL
      ${city ? "AND LOWER(city) = LOWER($1)" : ""}
      GROUP BY metadata->>'promoterName'
      ORDER BY project_count DESC
      LIMIT 20
    `, city ? [city] : []);

    // 4. Project Type Distribution by Investment
    const typeDistribution = await query(`
      SELECT 
        project_type,
        COUNT(*) as count,
        SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
        AVG(CAST(total_project_cost AS NUMERIC)) as avg_investment,
        SUM(total_units) as total_units,
        AVG(total_area_sqmt) as avg_area
      FROM projects
      WHERE project_type IS NOT NULL
      ${city ? "AND LOWER(city) = LOWER($1)" : ""}
      GROUP BY project_type
      ORDER BY total_investment DESC
    `, city ? [city] : []);

    // 5. Monthly Trend (Last 12 months)
    const monthlyTrend = await query(`
      SELECT 
        DATE_TRUNC('month', rera_approval_date) as month,
        COUNT(*) as projects_approved,
        SUM(CAST(total_project_cost AS NUMERIC)) as investment_approved
      FROM projects
      WHERE rera_approval_date IS NOT NULL
        AND rera_approval_date >= CURRENT_DATE - INTERVAL '12 months'
      ${city ? "AND LOWER(city) = LOWER($1)" : ""}
      GROUP BY DATE_TRUNC('month', rera_approval_date)
      ORDER BY month DESC
    `, city ? [city] : []);

    // 6. Investment Size Categories (Simplified)
    const investmentCategories = await query(`
      WITH investment_buckets AS (
        SELECT 
          CASE 
            WHEN CAST(total_project_cost AS NUMERIC) < 10000000 THEN 'Under 1 Cr'
            WHEN CAST(total_project_cost AS NUMERIC) < 50000000 THEN '1-5 Cr'
            WHEN CAST(total_project_cost AS NUMERIC) < 100000000 THEN '5-10 Cr'
            WHEN CAST(total_project_cost AS NUMERIC) < 500000000 THEN '10-50 Cr'
            WHEN CAST(total_project_cost AS NUMERIC) < 1000000000 THEN '50-100 Cr'
            ELSE 'Above 100 Cr'
          END as category,
          total_project_cost,
          total_units
        FROM projects
        WHERE total_project_cost IS NOT NULL 
          AND CAST(total_project_cost AS NUMERIC) > 0
          ${city ? "AND LOWER(city) = LOWER($1)" : ""}
      )
      SELECT 
        category as investment_category,
        COUNT(*) as project_count,
        SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
        AVG(total_units) as avg_units
      FROM investment_buckets
      GROUP BY category
      ORDER BY 
        CASE category
          WHEN 'Under 1 Cr' THEN 1
          WHEN '1-5 Cr' THEN 2
          WHEN '5-10 Cr' THEN 3
          WHEN '10-50 Cr' THEN 4
          WHEN '50-100 Cr' THEN 5
          ELSE 6
        END
    `, city ? [city] : []);

    // 7. Project Timeline Analysis
    const timelineAnalysis = await query(`
      SELECT 
        EXTRACT(YEAR FROM project_start_date) as year,
        EXTRACT(MONTH FROM project_start_date) as month,
        COUNT(*) as projects_started,
        SUM(CAST(total_project_cost AS NUMERIC)) as investment_started
      FROM projects
      WHERE project_start_date IS NOT NULL
        AND EXTRACT(YEAR FROM project_start_date) >= 2020
      ${city ? "AND LOWER(city) = LOWER($1)" : ""}
      GROUP BY EXTRACT(YEAR FROM project_start_date), EXTRACT(MONTH FROM project_start_date)
      ORDER BY year DESC, month DESC
      LIMIT 24
    `, city ? [city] : []);

    // 8. Area-wise Analysis (for city view)
    let areaAnalysis = null;
    if (city) {
      areaAnalysis = await query(`
        SELECT 
          locality,
          COUNT(*) as project_count,
          SUM(CAST(total_project_cost AS NUMERIC)) as total_investment,
          AVG(CAST(total_project_cost AS NUMERIC)) as avg_project_cost,
          SUM(total_units) as total_units,
          STRING_AGG(DISTINCT project_type, ', ') as project_types
        FROM projects
        WHERE LOWER(city) = LOWER($1) AND locality IS NOT NULL
        GROUP BY locality
        ORDER BY project_count DESC
        LIMIT 20
      `, [city]);
    }

    return NextResponse.json({
      success: true,
      analytics: {
        marketStats: marketStats.rows[0],
        cityDistribution: cityDistribution.rows,
        topDevelopers: topDevelopers.rows,
        timelineAnalysis: timelineAnalysis.rows,
        typeDistribution: typeDistribution.rows,
        monthlyTrend: monthlyTrend.rows,
        investmentCategories: investmentCategories.rows,
        areaAnalysis: areaAnalysis?.rows || null
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}