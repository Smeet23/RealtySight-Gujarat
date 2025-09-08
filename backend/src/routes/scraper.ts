import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

export const scraperRoutes = Router();

// Path to real RERA data file
const reraDataPath = path.join(process.cwd(), 'rera-data.json');

// Load real RERA data
async function loadReraData() {
  try {
    const data = await fs.readFile(reraDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading RERA data:', error);
    // Return minimal data structure if file doesn't exist
    return {
      lastUpdated: new Date().toISOString(),
      totalProjects: 0,
      projects: []
    };
  }
}

// Get localities for a city
function getLocalitiesForCity(cityName: string): Array<{ name: string; pincode: string }> {
  const cityLocalities: Record<string, Array<{ name: string; pincode: string }>> = {
    'Gandhinagar': [
      { name: 'Sargasan', pincode: '382421' },
      { name: 'Kudasan', pincode: '382421' },
      { name: 'Raysan', pincode: '382007' },
      { name: 'Vavol', pincode: '382016' },
      { name: 'Randesan', pincode: '382610' },
      { name: 'Koba', pincode: '382426' },
      { name: 'Adalaj', pincode: '382421' },
      { name: 'Chandkheda', pincode: '382424' },
      { name: 'Motera', pincode: '382424' },
      { name: 'Tragad', pincode: '382470' }
    ],
    'Ahmedabad': [
      { name: 'Bopal', pincode: '380058' },
      { name: 'South Bopal', pincode: '380058' },
      { name: 'Ghuma', pincode: '380058' },
      { name: 'Shela', pincode: '380059' },
      { name: 'Thaltej', pincode: '380054' },
      { name: 'Satellite', pincode: '380015' },
      { name: 'Prahlad Nagar', pincode: '380015' },
      { name: 'Bodakdev', pincode: '380054' },
      { name: 'Vastrapur', pincode: '380015' },
      { name: 'SG Highway', pincode: '380054' },
      { name: 'Sindhu Bhavan', pincode: '380054' },
      { name: 'Makarba', pincode: '380051' },
      { name: 'Vejalpur', pincode: '380051' },
      { name: 'Gota', pincode: '382481' },
      { name: 'Vaishnodevi', pincode: '382481' },
      { name: 'Chandlodia', pincode: '382481' },
      { name: 'Sola', pincode: '380063' },
      { name: 'Science City', pincode: '380060' },
      { name: 'Bhadaj', pincode: '380060' },
      { name: 'Maninagar', pincode: '380008' }
    ],
    'Surat': [
      { name: 'Vesu', pincode: '395007' },
      { name: 'Althan', pincode: '395017' },
      { name: 'Adajan', pincode: '395009' },
      { name: 'Pal', pincode: '395009' },
      { name: 'Palanpur', pincode: '395009' },
      { name: 'Piplod', pincode: '395007' },
      { name: 'Dumas', pincode: '394550' },
      { name: 'Canal Road', pincode: '395007' },
      { name: 'City Light', pincode: '395007' },
      { name: 'Athwa', pincode: '395007' }
    ],
    'Vadodara': [
      { name: 'Alkapuri', pincode: '390007' },
      { name: 'Vasna', pincode: '390007' },
      { name: 'Gotri', pincode: '390021' },
      { name: 'Sevasi', pincode: '391101' },
      { name: 'Bhayli', pincode: '391410' },
      { name: 'Manjalpur', pincode: '390011' },
      { name: 'Makarpura', pincode: '390010' },
      { name: 'Waghodia', pincode: '391760' },
      { name: 'Khodiyar Nagar', pincode: '390025' },
      { name: 'Subhanpura', pincode: '390023' }
    ],
    'Rajkot': [
      { name: 'Kalawad Road', pincode: '360001' },
      { name: 'University Road', pincode: '360005' },
      { name: 'Raiya Road', pincode: '360007' },
      { name: 'Gondal Road', pincode: '360004' },
      { name: 'Kothariya Road', pincode: '360022' },
      { name: 'Sadhuvasvani Road', pincode: '360005' },
      { name: 'Mavdi', pincode: '360004' },
      { name: 'Aji Vasahat', pincode: '360003' },
      { name: 'Nana Mauva', pincode: '360005' },
      { name: 'Madhapar', pincode: '360006' }
    ]
  };

  const normalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
  return cityLocalities[normalizedCity] || [];
}

// Main data endpoint
scraperRoutes.get('/data', async (_req, res) => {
  try {
    const data = await loadReraData();
    
    // Calculate city statistics
    const cityStats: Record<string, number> = {};
    data.projects.forEach((project: any) => {
      const city = project.district || 'Others';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      cityStats,
      totalProjects: data.totalProjects,
      projects: data.projects,
      recentProjects: data.projects.slice(0, 10)
    });
  } catch (error) {
    console.error('Error in /data endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load RERA data'
    });
  }
});

// Projects listing with filtering
scraperRoutes.get('/projects', async (req, res) => {
  try {
    const data = await loadReraData();
    
    const {
      city,
      developer,
      type,
      search,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      limit = 20,
      locality,
      pincode
    } = req.query;

    let projects = [...data.projects];

    // Apply filters
    if (city) {
      projects = projects.filter((p: any) => 
        p.district?.toLowerCase() === city.toString().toLowerCase()
      );
    }

    if (locality) {
      projects = projects.filter((p: any) => 
        p.locality?.toLowerCase() === locality.toString().toLowerCase()
      );
    }

    if (pincode) {
      projects = projects.filter((p: any) => 
        p.pincode === pincode.toString()
      );
    }

    if (developer) {
      projects = projects.filter((p: any) => 
        p.promoterName?.toLowerCase().includes(developer.toString().toLowerCase())
      );
    }

    if (type) {
      projects = projects.filter((p: any) => 
        p.projectType?.toLowerCase().includes(type.toString().toLowerCase())
      );
    }

    if (search) {
      const searchTerm = search.toString().toLowerCase();
      projects = projects.filter((p: any) => 
        p.projectName?.toLowerCase().includes(searchTerm) ||
        p.promoterName?.toLowerCase().includes(searchTerm) ||
        p.locality?.toLowerCase().includes(searchTerm) ||
        p.address?.toLowerCase().includes(searchTerm)
      );
    }

    // Sorting
    projects.sort((a: any, b: any) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = (a.projectName || '').localeCompare(b.projectName || '');
          break;
        case 'booking':
          compareValue = (b.bookingPercentage || 0) - (a.bookingPercentage || 0);
          break;
        case 'units':
          compareValue = (b.totalUnits || 0) - (a.totalUnits || 0);
          break;
        default:
          compareValue = 0;
      }
      return order === 'asc' ? compareValue : -compareValue;
    });

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedProjects = projects.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProjects,
      totalCount: projects.length,
      page: Number(page),
      totalPages: Math.ceil(projects.length / Number(limit)),
      hasMore: endIndex < projects.length
    });
  } catch (error) {
    console.error('Error in /projects endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load projects'
    });
  }
});

// Project detail by RERA ID
scraperRoutes.get('/project/:reraId', async (req, res) => {
  try {
    const { reraId } = req.params;
    const data = await loadReraData();
    
    const project = data.projects.find((p: any) => p.reraId === reraId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    return res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch project details'
    });
  }
});

// Available filters
scraperRoutes.get('/filters', async (_req, res) => {
  try {
    const data = await loadReraData();
    
    // Extract unique values for filters
    const cities = [...new Set(data.projects.map((p: any) => p.district).filter(Boolean))];
    const developers = [...new Set(data.projects.map((p: any) => p.promoterName).filter(Boolean))];
    const projectTypes = [...new Set(data.projects.map((p: any) => p.projectType).filter(Boolean))];
    
    res.json({
      success: true,
      cities: cities.sort(),
      developers: developers.sort(),
      projectTypes: projectTypes.sort()
    });
  } catch (error) {
    console.error('Error in /filters endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load filters'
    });
  }
});

// City localities endpoint
scraperRoutes.get('/localities/:city', (req, res) => {
  const { city } = req.params;
  const localities = getLocalitiesForCity(city);
  
  res.json({
    success: true,
    city,
    localities
  });
});

// Status endpoint
scraperRoutes.get('/status', async (_req, res) => {
  try {
    const data = await loadReraData();
    
    res.json({
      success: true,
      lastUpdated: data.lastUpdated,
      projectsCount: data.projects.length,
      cities: [...new Set(data.projects.map((p: any) => p.district).filter(Boolean))]
    });
  } catch (error) {
    console.error('Error in /status endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
});

// Trigger scraper endpoint (placeholder - actual scraping happens via separate script)
scraperRoutes.post('/trigger', async (_req, res) => {
  res.json({
    success: true,
    message: 'Please run npm run scrape to update RERA data'
  });
});