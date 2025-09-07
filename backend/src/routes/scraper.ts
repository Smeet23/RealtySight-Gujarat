import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
export const scraperRoutes = Router();

// In-memory cache for scraped data
let cachedData: any = {
  lastUpdated: null,
  cityStats: {},
  projects: []
};

scraperRoutes.get('/status', (_req, res) => {
  res.json({
    success: true,
    lastUpdated: cachedData.lastUpdated,
    projectsCount: cachedData.projects.length,
    cities: Object.keys(cachedData.cityStats)
  });
});

scraperRoutes.post('/trigger', async (_req, res) => {
  try {
    // Run the scraper in the background
    const scraperPath = path.join(__dirname, '../../../../scraper');
    const command = `cd ${scraperPath} && npm run scrape:v2`;
    
    execAsync(command).then(({ stdout, stderr }) => {
      console.log('Scraper output:', stdout);
      if (stderr) console.error('Scraper errors:', stderr);
      
      // Update cached data (in production, this would come from database)
      cachedData.lastUpdated = new Date().toISOString();
    }).catch(error => {
      console.error('Scraper failed:', error);
    });

    res.json({
      success: true,
      message: 'Scraper triggered in background'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scraper'
    });
  }
});

// Mock real data based on screenshots
const mockRealData = {
  cityStats: {
    'Ahmedabad': 2059,
    'Surat': 930,
    'Vadodara': 1511,
    'Rajkot': 1112,
    'Gandhinagar': 651,
    'Bhavnagar': 179,
    'Jamnagar': 70,
    'Junagadh': 114,
    'Anand': 621,
    'Others': 9299
  },
  recentProjects: [
    {
      projectName: 'Sadama Homes 2',
      promoterName: 'Lavori Corporation',
      projectType: 'Residential/Group Housing',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00444/EX1/150219',
      approvedOn: '14-10-2017',
      bookingPercentage: 85,
      price: '₹55-95L',
      totalUnits: 220,
      availableUnits: 33
    },
    {
      projectName: 'KP VILLAS',
      promoterName: 'GALAXY DEVELOPERS',
      projectType: 'Residential/Group Housing',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/SANAND/RAA00171/EX1/050519',
      approvedOn: '21-05-2018',
      bookingPercentage: 72,
      price: '₹35-68L',
      totalUnits: 180,
      availableUnits: 50
    },
    {
      projectName: 'ASTHA',
      promoterName: 'B R Projects Private Limited',
      projectType: 'Residential/Group Housing',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/DASKROI/RAA/RAA01152/080518',
      approvedOn: '08-05-2018',
      bookingPercentage: 100,
      price: '₹28-52L',
      totalUnits: 150,
      availableUnits: 0
    },
    {
      projectName: 'Shivalik Shilp',
      promoterName: 'Shivalik Group',
      projectType: 'Residential',
      district: 'Surat',
      reraId: 'PR/GJ/SURAT/SURAT/RAA00234/150220',
      approvedOn: '15-02-2020',
      bookingPercentage: 65,
      price: '₹45-85L',
      totalUnits: 200,
      availableUnits: 70
    },
    {
      projectName: 'Savvy Swaraaj',
      promoterName: 'Savvy Group',
      projectType: 'Commercial',
      district: 'Vadodara',
      reraId: 'PR/GJ/VADODARA/VADODARA/RAA00567/210320',
      approvedOn: '21-03-2020',
      bookingPercentage: 45,
      price: '₹25-45L',
      totalUnits: 150,
      availableUnits: 82
    },
    {
      projectName: 'Ganesh Maple Tree',
      promoterName: 'Ganesh Housing',
      projectType: 'Residential',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00789/100420',
      approvedOn: '10-04-2020',
      bookingPercentage: 92,
      price: '₹65-125L',
      totalUnits: 180,
      availableUnits: 14
    },
    {
      projectName: 'Adani Shantigram',
      promoterName: 'Adani Realty',
      projectType: 'Township',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00890/150520',
      approvedOn: '15-05-2020',
      bookingPercentage: 78,
      price: '₹85-250L',
      totalUnits: 500,
      availableUnits: 110
    },
    {
      projectName: 'Dream Exotica',
      promoterName: 'Dream Group',
      projectType: 'Residential',
      district: 'Surat',
      reraId: 'PR/GJ/SURAT/SURAT/RAA00890/120621',
      approvedOn: '12-06-2021',
      bookingPercentage: 88,
      price: '₹58-112L',
      totalUnits: 320,
      availableUnits: 38
    },
    {
      projectName: 'Raghuvir Heights',
      promoterName: 'Raghuvir Corporation',
      projectType: 'Residential',
      district: 'Surat',
      reraId: 'PR/GJ/SURAT/SURAT/RAA00945/250721',
      approvedOn: '25-07-2021',
      bookingPercentage: 76,
      price: '₹48-92L',
      totalUnits: 280,
      availableUnits: 67
    },
    {
      projectName: 'Alembic City',
      promoterName: 'Alembic Group',
      projectType: 'Township',
      district: 'Vadodara',
      reraId: 'PR/GJ/VADODARA/VADODARA/RAA00678/180822',
      approvedOn: '18-08-2022',
      bookingPercentage: 82,
      price: '₹42-95L',
      totalUnits: 450,
      availableUnits: 81
    },
    {
      projectName: 'KKP Signature',
      promoterName: 'KKP Group',
      projectType: 'Residential',
      district: 'Rajkot',
      reraId: 'PR/GJ/RAJKOT/RAJKOT/RAA00523/090922',
      approvedOn: '09-09-2022',
      bookingPercentage: 67,
      price: '₹32-68L',
      totalUnits: 240,
      availableUnits: 79
    },
    {
      projectName: 'GIFT One',
      promoterName: 'GIFT City',
      projectType: 'Commercial',
      district: 'Gandhinagar',
      reraId: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/RAA00789/151022',
      approvedOn: '15-10-2022',
      bookingPercentage: 95,
      price: '₹75-185L',
      totalUnits: 180,
      availableUnits: 9
    },
    {
      projectName: 'Sun Sky Park',
      promoterName: 'Sun Builders',
      projectType: 'Residential',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00834/201122',
      approvedOn: '20-11-2022',
      bookingPercentage: 84,
      price: '₹52-108L',
      totalUnits: 310,
      availableUnits: 50
    },
    {
      projectName: 'Goyal Orchid',
      promoterName: 'Goyal & Co',
      projectType: 'Residential',
      district: 'Ahmedabad',
      reraId: 'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00912/050123',
      approvedOn: '05-01-2023',
      bookingPercentage: 73,
      price: '₹46-89L',
      totalUnits: 260,
      availableUnits: 70
    },
    {
      projectName: 'Sahajanand Square',
      promoterName: 'Sahajanand Group',
      projectType: 'Mixed Development',
      district: 'Vadodara',
      reraId: 'PR/GJ/VADODARA/VADODARA/RAA00756/180223',
      approvedOn: '18-02-2023',
      bookingPercentage: 69,
      price: '₹38-78L',
      totalUnits: 340,
      availableUnits: 105
    },
    {
      projectName: 'Trinity Towers',
      promoterName: 'Trinity Group',
      projectType: 'Residential',
      district: 'Vadodara',
      reraId: 'PR/GJ/VADODARA/VADODARA/RAA00823/120323',
      approvedOn: '12-03-2023',
      bookingPercentage: 81,
      price: '₹44-85L',
      totalUnits: 290,
      availableUnits: 55
    },
    {
      projectName: 'Radhe Krishna Heights',
      promoterName: 'Radhe Developers',
      projectType: 'Residential',
      district: 'Rajkot',
      reraId: 'PR/GJ/RAJKOT/RAJKOT/RAA00645/080423',
      approvedOn: '08-04-2023',
      bookingPercentage: 74,
      price: '₹29-58L',
      totalUnits: 220,
      availableUnits: 57
    },
    {
      projectName: 'Swaminarayan Dham',
      promoterName: 'Swaminarayan Group',
      projectType: 'Residential',
      district: 'Gandhinagar',
      reraId: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/RAA00567/250523',
      approvedOn: '25-05-2023',
      bookingPercentage: 87,
      price: '₹58-128L',
      totalUnits: 200,
      availableUnits: 26
    },
    {
      projectName: 'Vaishnodevi Complex',
      promoterName: 'Vaishnodevi Group',
      projectType: 'Commercial',
      district: 'Gandhinagar',
      reraId: 'PR/GJ/GANDHINAGAR/GANDHINAGAR/RAA00689/100623',
      approvedOn: '10-06-2023',
      bookingPercentage: 91,
      price: '₹65-145L',
      totalUnits: 160,
      availableUnits: 14
    },
    {
      projectName: 'Apple One',
      promoterName: 'Apple Group',
      projectType: 'Residential',
      district: 'Surat',
      reraId: 'PR/GJ/SURAT/SURAT/RAA00723/280723',
      approvedOn: '28-07-2023',
      bookingPercentage: 79,
      price: '₹51-98L',
      totalUnits: 270,
      availableUnits: 57
    }
  ],
  summary: {
    totalProjects: 16027,
    totalRegistered: 5001,
    avgBookingRate: 78.5,
    topDevelopers: [
      'Adani Realty',
      'Ganesh Housing',
      'Savvy Group',
      'Shivalik Group',
      'Goyal & Co'
    ]
  }
};

// Function to generate comprehensive mock projects for all cities
const generateAllProjects = (): any[] => {
  const cities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Vapi'];
  const developers = [
    'Adani Realty', 'Ganesh Housing', 'Savvy Group', 'Shivalik Group', 'Goyal & Co', 
    'Sun Builders', 'Bakeri Group', 'Safal Group', 'Pacifica Group', 'Mahindra Lifespaces',
    'Shree Developers', 'Dream Group', 'Raghuvir Corporation', 'Alembic Group', 'KKP Group',
    'GIFT City', 'Swaminarayan Group', 'Vaishnodevi Group', 'Apple Group', 'Trinity Group',
    'Sahajanand Group', 'Radhe Developers', 'Aagam Group', 'Shreenath Group', 'Shivam Group',
    'Krishna Group', 'Om Developers', 'Satyam Group', 'Akshar Group', 'Navkar Group'
  ];
  
  const projectTypes = ['Residential', 'Commercial', 'Township', 'Mixed Development', 'Plotted Development'];
  
  // Real RERA project names by city
  const realProjectNames: Record<string, string[]> = {
    'Gandhinagar': ['SWAGAT GLASGOW', 'GIFT One', 'Adani Shantigram', 'Satyam Paradise', 'Swaminarayan Dham', 'Vaishnodevi Complex'],
    'Ahmedabad': ['Safal Parishkaar', 'Ganesh Maple Tree', 'Sun Sky Park', 'Goyal Orchid', 'Bakeri City', 'Pacifica Aurum'],
    'Surat': ['Dream Exotica', 'Raghuvir Heights', 'Apple One', 'Shivalik Shilp', 'Adani Atelier Greens'],
    'Vadodara': ['Alembic City', 'Sahajanand Square', 'Trinity Towers', 'Goyal Orchid City', 'Aagam Heights'],
    'Rajkot': ['KKP Signature', 'Radhe Krishna Heights', 'Shivam Elegance', 'Krishna City', 'Om Heights']
  };
  
  const allProjects: any[] = [];
  
  // Generate projects for each city based on actual RERA statistics
  const cityProjectCounts: Record<string, number> = {
    'Ahmedabad': 2059,
    'Surat': 930, 
    'Vadodara': 1511,
    'Rajkot': 1112,
    'Gandhinagar': 651,
    'Bhavnagar': 179,
    'Jamnagar': 70,
    'Junagadh': 114,
    'Anand': 621,
    'Vapi': 150
  };

  // City-wise pincode mappings based on real Gujarat pincodes
  const cityPincodes: Record<string, string[]> = {
    'Ahmedabad': ['380001', '380002', '380003', '380004', '380005', '380006', '380007', '380008', '380009', '380013', '380015', '380016', '380018', '380019', '380021', '380022', '380024', '380026', '380027', '380028', '380051', '380052', '380053', '380054', '380055', '380061', '380063'],
    'Surat': ['395001', '395002', '395003', '395004', '395005', '395006', '395007', '395008', '395009', '395010', '395017', '394101', '394107', '394210', '394220', '394221', '394230', '394248', '394327'],
    'Vadodara': ['390001', '390002', '390003', '390004', '390005', '390006', '390007', '390008', '390009', '390010', '390011', '390012', '390013', '390015', '390016', '390017', '390018', '390019', '390020', '390021', '390022'],
    'Rajkot': ['360001', '360002', '360003', '360004', '360005', '360006', '360007', '360110', '360311', '360370', '360410', '360490', '360510', '360575'],
    'Gandhinagar': ['382007', '382009', '382010', '382011', '382012', '382013', '382014', '382015', '382016', '382017', '382018', '382019', '382020', '382021', '382022', '382023', '382024', '382025', '382026', '382027', '382028', '382029', '382421', '382422', '382423', '382424', '382425', '382426', '382427', '382428', '382721'],
    'Bhavnagar': ['364001', '364002', '364003', '364004', '364005', '364290', '364310', '364505', '364710', '364750'],
    'Jamnagar': ['361001', '361002', '361003', '361004', '361005', '361006', '361008', '361009', '361010', '361011', '361012'],
    'Junagadh': ['362001', '362002', '362003', '362004', '362005', '362015', '362220', '362225', '362226', '362227'],
    'Anand': ['388001', '388002', '388120', '388180', '388220', '388230', '388235', '388260', '388270', '388305'],
    'Vapi': ['396191', '396193', '396195', '396230', '396235', '396415', '396424', '396450', '396465', '396590']
  };
  
  let projectIndex = 1;
  
  cities.forEach(city => {
    const projectCount = cityProjectCounts[city] || 100; // Use actual RERA numbers
    
    for (let i = 0; i < projectCount; i++) {
      const developer = developers[i % developers.length];
      const projectType = projectTypes[i % projectTypes.length];
      const bookingPercentage = Math.floor(Math.random() * 80) + 20; // 20-100%
      const basePrice = city === 'Ahmedabad' || city === 'Gandhinagar' ? 50 : 30;
      const priceVariation = Math.floor(Math.random() * 50) + basePrice;
      
      // Use real project names for first few projects, then generate synthetic ones
      const cityRealNames = realProjectNames[city] || [];
      let projectName;
      if (i < cityRealNames.length) {
        projectName = cityRealNames[i];
      } else {
        projectName = `${developer} ${city} ${i + 1}`;
      }
      
      // Get random pincode for the city
      const cityPincodeList = cityPincodes[city] || ['000000'];
      const pincode = cityPincodeList[Math.floor(Math.random() * cityPincodeList.length)];
      
      allProjects.push({
        projectName: projectName,
        promoterName: developer,
        projectType: projectType,
        district: city,
        pincode: pincode,
        reraId: `PR/GJ/${city.toUpperCase()}/${city.toUpperCase()}/RAA${String(projectIndex).padStart(5, '0')}/${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}${22 + Math.floor(Math.random() * 3)}`,
        approvedOn: `${Math.floor(Math.random() * 28) + 1}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${2022 + Math.floor(Math.random() * 2)}`,
        bookingPercentage: bookingPercentage,
        price: `₹${priceVariation}-${priceVariation + Math.floor(Math.random() * 50) + 20}L`,
        totalUnits: Math.floor(Math.random() * 400) + 100,
        availableUnits: Math.floor(Math.random() * 100) + 10
      });
      
      projectIndex++;
    }
  });
  
  return allProjects;
};

// Generate all projects once
const allGeneratedProjects = generateAllProjects();

// Get city pincodes mapping for frontend
const getCityPincodes = () => {
  const cityPincodes: Record<string, string[]> = {
    'Ahmedabad': ['380001', '380002', '380003', '380004', '380005', '380006', '380007', '380008', '380009', '380013', '380015', '380016', '380018', '380019', '380021', '380022', '380024', '380026', '380027', '380028', '380051', '380052', '380053', '380054', '380055', '380061', '380063'],
    'Surat': ['395001', '395002', '395003', '395004', '395005', '395006', '395007', '395008', '395009', '395010', '395017', '394101', '394107', '394210', '394220', '394221', '394230', '394248', '394327'],
    'Vadodara': ['390001', '390002', '390003', '390004', '390005', '390006', '390007', '390008', '390009', '390010', '390011', '390012', '390013', '390015', '390016', '390017', '390018', '390019', '390020', '390021', '390022'],
    'Rajkot': ['360001', '360002', '360003', '360004', '360005', '360006', '360007', '360110', '360311', '360370', '360410', '360490', '360510', '360575'],
    'Gandhinagar': ['382007', '382009', '382010', '382011', '382012', '382013', '382014', '382015', '382016', '382017', '382018', '382019', '382020', '382021', '382022', '382023', '382024', '382025', '382026', '382027', '382028', '382029', '382421', '382422', '382423', '382424', '382425', '382426', '382427', '382428', '382721'],
    'Bhavnagar': ['364001', '364002', '364003', '364004', '364005', '364290', '364310', '364505', '364710', '364750'],
    'Jamnagar': ['361001', '361002', '361003', '361004', '361005', '361006', '361008', '361009', '361010', '361011', '361012'],
    'Junagadh': ['362001', '362002', '362003', '362004', '362005', '362015', '362220', '362225', '362226', '362227'],
    'Anand': ['388001', '388002', '388120', '388180', '388220', '388230', '388235', '388260', '388270', '388305'],
    'Vapi': ['396191', '396193', '396195', '396230', '396235', '396415', '396424', '396450', '396465', '396590']
  };
  return cityPincodes;
};

scraperRoutes.get('/projects', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const city = req.query.city as string;
  const search = req.query.search as string;
  const pincode = req.query.pincode as string;
  
  // Use generated projects + original API projects
  const combinedProjects = [...mockRealData.recentProjects, ...allGeneratedProjects];
  let allProjects = combinedProjects;
  
  let filteredProjects = [...allProjects];
  
  // Apply city filter
  if (city && city !== 'all') {
    filteredProjects = filteredProjects.filter(p => 
      p.district.toLowerCase() === city.toLowerCase()
    );
  }
  
  // Apply pincode filter
  if (pincode) {
    filteredProjects = filteredProjects.filter(p => 
      p.pincode === pincode
    );
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.projectName.toLowerCase().includes(searchLower) ||
      p.promoterName.toLowerCase().includes(searchLower) ||
      p.reraId.toLowerCase().includes(searchLower) ||
      p.pincode.includes(search)
    );
  }
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      projects: paginatedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProjects.length / limit),
        totalProjects: filteredProjects.length,
        hasNext: endIndex < filteredProjects.length,
        hasPrev: page > 1
      }
    }
  });
});

// Get pincodes for a specific city
scraperRoutes.get('/pincodes', (req, res) => {
  const city = req.query.city as string;
  const cityPincodes = getCityPincodes();
  
  if (city && cityPincodes[city]) {
    res.json({
      success: true,
      data: {
        city: city,
        pincodes: cityPincodes[city]
      }
    });
  } else if (!city) {
    // Return all pincodes for all cities
    res.json({
      success: true,
      data: cityPincodes
    });
  } else {
    res.json({
      success: false,
      error: 'City not found'
    });
  }
});

scraperRoutes.get('/data', (_req, res) => {
  // Return cached/stored data
  // In production, this would query the database

  res.json({
    success: true,
    data: cachedData.projects.length > 0 ? cachedData : mockRealData,
    lastUpdated: cachedData.lastUpdated || new Date().toISOString()
  });
});