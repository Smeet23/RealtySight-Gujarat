import { NextResponse } from 'next/server';

export interface RERAProject {
  projectRegId: number;
  projectName: string;
  promoterName: string;
  projectType: string;
  projectCost: string;
  project_status: string;
  project_address: string;
  promoterAddress: string;
  districtName: string;
  regNo: string;
  approvedOn: string;
  startDate: string;
  endDate: string;
  pmtr_email_id: string;
  pr_mobile_no: string;
  total_est_cost_of_proj: string;
  projOrgFDate: string;
  extDate: string | null;
}

export interface RERAApiResponse {
  status: string;
  message: string;
  data: RERAProject[];
}

const RERA_API_BASE_URL = 'https://gujrera.gujarat.gov.in/dashboard/get-district-wise-projectlist';

export async function fetchRERAProjects(city: string): Promise<RERAProject[]> {
  try {
    // Format city name for API (capitalize first letter)
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    
    // Construct API URL
    // Pattern: /0/0/all/{city}/all
    const apiUrl = `${RERA_API_BASE_URL}/0/0/all/${formattedCity}/all`;
    
    console.log(`Fetching RERA data from: ${apiUrl}`);
    
    // Note: The RERA API may have SSL issues in some environments
    // In production, you might need to use a proxy or server-side fetch
    // For now, we'll use standard fetch which should work in Next.js
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RERADataFetcher/1.0)',
      },
      // Note: Next.js caching is done at the route level
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RERA data: ${response.status}`);
    }

    const data: RERAApiResponse = await response.json();
    
    if (data.status !== '200') {
      throw new Error(`RERA API error: ${data.message}`);
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching RERA projects:', error);
    throw error;
  }
}

// Helper function to format project data for display
export function formatProjectData(project: RERAProject) {
  return {
    id: project.projectRegId,
    name: project.projectName,
    developer: project.promoterName,
    type: project.projectType,
    status: project.project_status,
    location: project.project_address,
    city: project.districtName,
    registrationNo: project.regNo,
    approvedDate: project.approvedOn,
    startDate: project.startDate,
    completionDate: project.endDate,
    projectCost: parseFloat(project.total_est_cost_of_proj || project.projectCost),
    contact: {
      email: project.pmtr_email_id,
      phone: project.pr_mobile_no
    }
  };
}

// Get summary statistics for projects
export function getProjectStats(projects: RERAProject[]) {
  const stats = {
    total: projects.length,
    ongoing: 0,
    completed: 0,
    new: 0,
    residential: 0,
    commercial: 0,
    mixed: 0,
    totalValue: 0
  };

  projects.forEach(project => {
    // Status counts
    const status = project.project_status?.toLowerCase();
    if (status === 'ongoing') stats.ongoing++;
    else if (status === 'completed') stats.completed++;
    else if (status === 'new') stats.new++;

    // Type counts
    const type = project.projectType?.toLowerCase();
    if (type?.includes('residential') || type?.includes('group housing')) {
      stats.residential++;
    } else if (type?.includes('commercial')) {
      stats.commercial++;
    } else if (type?.includes('mixed')) {
      stats.mixed++;
    }

    // Total value
    const cost = parseFloat(project.total_est_cost_of_proj || project.projectCost || '0');
    stats.totalValue += cost;
  });

  return stats;
}