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

  // City-wise locality mappings with pincodes
  interface Locality {
    name: string;
    pincode: string;
  }
  
  const cityLocalities: Record<string, Locality[]> = {
    'Gandhinagar': [
      { name: 'Sector 1', pincode: '382007' },
      { name: 'Sector 2', pincode: '382007' },
      { name: 'Sector 3', pincode: '382009' },
      { name: 'Sector 4', pincode: '382009' },
      { name: 'Sector 5', pincode: '382010' },
      { name: 'Sector 6', pincode: '382010' },
      { name: 'Sector 7', pincode: '382011' },
      { name: 'Sector 11', pincode: '382011' },
      { name: 'Sector 12', pincode: '382012' },
      { name: 'Sector 13', pincode: '382013' },
      { name: 'Sector 14', pincode: '382014' },
      { name: 'Sector 15', pincode: '382015' },
      { name: 'Sector 16', pincode: '382016' },
      { name: 'Sector 21', pincode: '382021' },
      { name: 'Sector 22', pincode: '382022' },
      { name: 'Sector 23', pincode: '382023' },
      { name: 'Sector 24', pincode: '382024' },
      { name: 'Sector 25', pincode: '382025' },
      { name: 'Sector 26', pincode: '382026' },
      { name: 'Sector 27', pincode: '382027' },
      { name: 'Sector 28', pincode: '382028' },
      { name: 'Sector 29', pincode: '382029' },
      { name: 'Kudasan', pincode: '382421' },
      { name: 'Sargasan', pincode: '382423' },
      { name: 'GIFT City', pincode: '382355' },
      { name: 'Randesan', pincode: '382424' },
      { name: 'Raysan', pincode: '382425' },
      { name: 'Pethapur', pincode: '382426' },
      { name: 'Shahpur', pincode: '382427' },
      { name: 'Vavol', pincode: '382428' },
      { name: 'Chiloda', pincode: '382721' }
    ],
    'Ahmedabad': [
      { name: 'Kalupur', pincode: '380001' },
      { name: 'Dariyapur', pincode: '380001' },
      { name: 'Shahpur', pincode: '380001' },
      { name: 'Khadia', pincode: '380002' },
      { name: 'Kankaria', pincode: '380002' },
      { name: 'Raikhad', pincode: '380003' },
      { name: 'Manek Chowk', pincode: '380003' },
      { name: 'Shahibaug', pincode: '380004' },
      { name: 'Saraspur', pincode: '380005' },
      { name: 'Paldi', pincode: '380006' },
      { name: 'Navrangpura', pincode: '380009' },
      { name: 'Naranpura', pincode: '380013' },
      { name: 'Satellite', pincode: '380015' },
      { name: 'Ashram Road', pincode: '380019' },
      { name: 'Maninagar', pincode: '380022' },
      { name: 'Vastrapur', pincode: '380026' },
      { name: 'Thaltej', pincode: '380054' },
      { name: 'Prahlad Nagar', pincode: '380051' },
      { name: 'Bodakdev', pincode: '380054' },
      { name: 'SG Highway', pincode: '380054' },
      { name: 'Gota', pincode: '382481' },
      { name: 'Chandkheda', pincode: '382470' },
      { name: 'Motera', pincode: '380005' },
      { name: 'Sabarmati', pincode: '380018' },
      { name: 'Bopal', pincode: '380058' },
      { name: 'Shela', pincode: '380058' },
      { name: 'South Bopal', pincode: '380058' }
    ],
    'Surat': [
      { name: 'Nanpura', pincode: '395001' },
      { name: 'Athwalines', pincode: '395001' },
      { name: 'Ghod Dod Road', pincode: '395001' },
      { name: 'Ring Road', pincode: '395002' },
      { name: 'Udhna', pincode: '395002' },
      { name: 'Majura Gate', pincode: '395003' },
      { name: 'Varachha', pincode: '395004' },
      { name: 'Katargam', pincode: '395004' },
      { name: 'Adajan', pincode: '395005' },
      { name: 'Rander', pincode: '395005' },
      { name: 'Palanpur', pincode: '395009' },
      { name: 'Jahangirpura', pincode: '395009' },
      { name: 'Vesu', pincode: '395007' },
      { name: 'City Light', pincode: '395007' },
      { name: 'Althan', pincode: '395017' },
      { name: 'Bhatar', pincode: '395017' },
      { name: 'Piplod', pincode: '395007' },
      { name: 'Dumas', pincode: '394550' },
      { name: 'Parvat Patiya', pincode: '395010' }
    ],
    'Vadodara': [
      { name: 'Alkapuri', pincode: '390005' },
      { name: 'Race Course', pincode: '390007' },
      { name: 'Gotri', pincode: '390021' },
      { name: 'Manjalpur', pincode: '390011' },
      { name: 'Makarpura', pincode: '390010' },
      { name: 'Tarsali', pincode: '390009' },
      { name: 'Vasna', pincode: '390012' },
      { name: 'Waghodia Road', pincode: '390019' },
      { name: 'Karelibaug', pincode: '390018' },
      { name: 'Fatehgunj', pincode: '390002' },
      { name: 'Sayajigunj', pincode: '390020' },
      { name: 'Subhanpura', pincode: '390023' },
      { name: 'Ellora Park', pincode: '390023' },
      { name: 'Akota', pincode: '390020' },
      { name: 'Sama', pincode: '390024' },
      { name: 'Bhayli', pincode: '390025' },
      { name: 'Sevasi', pincode: '391101' },
      { name: 'Bill', pincode: '391160' },
      { name: 'Padra', pincode: '391440' }
    ],
    'Rajkot': [
      { name: 'Kalavad Road', pincode: '360001' },
      { name: 'University Road', pincode: '360005' },
      { name: 'Raiya Road', pincode: '360007' },
      { name: 'Mavdi', pincode: '360004' },
      { name: 'Gondal Road', pincode: '360002' },
      { name: 'Kothariya Road', pincode: '360022' },
      { name: 'Sadhu Vaswani Road', pincode: '360001' },
      { name: 'Aji Dam', pincode: '360003' },
      { name: 'Madhapar', pincode: '360006' },
      { name: 'Nana Mava', pincode: '360005' }
    ],
    'Bhavnagar': [
      { name: 'Krishnanagar', pincode: '364001' },
      { name: 'Sidsar Road', pincode: '364002' },
      { name: 'Nilambaug', pincode: '364003' },
      { name: 'Kaliyabid', pincode: '364004' },
      { name: 'Ghogha Circle', pincode: '364005' }
    ],
    'Jamnagar': [
      { name: 'Indira Gandhi Marg', pincode: '361001' },
      { name: 'Park Colony', pincode: '361008' },
      { name: 'Digvijay Plot', pincode: '361005' },
      { name: 'Aerodrome Road', pincode: '361006' }
    ],
    'Junagadh': [
      { name: 'Gandhigram', pincode: '362001' },
      { name: 'Joshipura', pincode: '362002' },
      { name: 'Zanzarda Road', pincode: '362015' },
      { name: 'Girnar Road', pincode: '362004' }
    ],
    'Anand': [
      { name: 'Vallabh Vidyanagar', pincode: '388120' },
      { name: 'GIDC', pincode: '388001' },
      { name: 'Gamdi', pincode: '388001' },
      { name: 'Karamsad', pincode: '388325' }
    ],
    'Vapi': [
      { name: 'GIDC', pincode: '396195' },
      { name: 'Chala', pincode: '396191' },
      { name: 'Gunjan', pincode: '396193' },
      { name: 'Balitha', pincode: '396191' }
    ]
  };

  // Create simple pincode list from localities for backward compatibility
  const cityPincodes: Record<string, string[]> = {};
  Object.keys(cityLocalities).forEach(city => {
    const uniquePincodes = [...new Set(cityLocalities[city].map(l => l.pincode))];
    cityPincodes[city] = uniquePincodes;
  });
  
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
      
      // Get random locality for the city
      const cityLocalityList = cityLocalities[city] || [{ name: 'Unknown', pincode: '000000' }];
      const randomLocality = cityLocalityList[Math.floor(Math.random() * cityLocalityList.length)];
      
      allProjects.push({
        projectName: projectName,
        promoterName: developer,
        projectType: projectType,
        district: city,
        locality: randomLocality.name,
        pincode: randomLocality.pincode,
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

// Get city localities mapping for frontend
const getCityLocalities = () => {
  // Return the cityLocalities defined above in the generateAllProjects function
  // We'll need to duplicate or move it here
  const localities: Record<string, Locality[]> = {
    'Gandhinagar': [
      { name: 'Sector 1', pincode: '382007' },
      { name: 'Sector 2', pincode: '382007' },
      { name: 'Sector 3', pincode: '382009' },
      { name: 'Sector 4', pincode: '382009' },
      { name: 'Sector 5', pincode: '382010' },
      { name: 'Sector 6', pincode: '382010' },
      { name: 'Sector 7', pincode: '382011' },
      { name: 'Sector 11', pincode: '382011' },
      { name: 'Sector 12', pincode: '382012' },
      { name: 'Sector 13', pincode: '382013' },
      { name: 'Sector 14', pincode: '382014' },
      { name: 'Sector 15', pincode: '382015' },
      { name: 'Sector 16', pincode: '382016' },
      { name: 'Sector 21', pincode: '382021' },
      { name: 'Sector 22', pincode: '382022' },
      { name: 'Sector 23', pincode: '382023' },
      { name: 'Sector 24', pincode: '382024' },
      { name: 'Sector 25', pincode: '382025' },
      { name: 'Sector 26', pincode: '382026' },
      { name: 'Sector 27', pincode: '382027' },
      { name: 'Sector 28', pincode: '382028' },
      { name: 'Sector 29', pincode: '382029' },
      { name: 'Kudasan', pincode: '382421' },
      { name: 'Sargasan', pincode: '382423' },
      { name: 'GIFT City', pincode: '382355' },
      { name: 'Randesan', pincode: '382424' },
      { name: 'Raysan', pincode: '382425' },
      { name: 'Pethapur', pincode: '382426' },
      { name: 'Shahpur', pincode: '382427' },
      { name: 'Vavol', pincode: '382428' },
      { name: 'Chiloda', pincode: '382721' }
    ],
    'Ahmedabad': [
      { name: 'Kalupur', pincode: '380001' },
      { name: 'Dariyapur', pincode: '380001' },
      { name: 'Shahpur', pincode: '380001' },
      { name: 'Khadia', pincode: '380002' },
      { name: 'Kankaria', pincode: '380002' },
      { name: 'Raikhad', pincode: '380003' },
      { name: 'Manek Chowk', pincode: '380003' },
      { name: 'Shahibaug', pincode: '380004' },
      { name: 'Saraspur', pincode: '380005' },
      { name: 'Paldi', pincode: '380006' },
      { name: 'Navrangpura', pincode: '380009' },
      { name: 'Naranpura', pincode: '380013' },
      { name: 'Satellite', pincode: '380015' },
      { name: 'Ashram Road', pincode: '380019' },
      { name: 'Maninagar', pincode: '380022' },
      { name: 'Vastrapur', pincode: '380026' },
      { name: 'Thaltej', pincode: '380054' },
      { name: 'Prahlad Nagar', pincode: '380051' },
      { name: 'Bodakdev', pincode: '380054' },
      { name: 'SG Highway', pincode: '380054' },
      { name: 'Gota', pincode: '382481' },
      { name: 'Chandkheda', pincode: '382470' },
      { name: 'Motera', pincode: '380005' },
      { name: 'Sabarmati', pincode: '380018' },
      { name: 'Bopal', pincode: '380058' },
      { name: 'Shela', pincode: '380058' },
      { name: 'South Bopal', pincode: '380058' }
    ],
    'Surat': [
      { name: 'Nanpura', pincode: '395001' },
      { name: 'Athwalines', pincode: '395001' },
      { name: 'Ghod Dod Road', pincode: '395001' },
      { name: 'Ring Road', pincode: '395002' },
      { name: 'Udhna', pincode: '395002' },
      { name: 'Majura Gate', pincode: '395003' },
      { name: 'Varachha', pincode: '395004' },
      { name: 'Katargam', pincode: '395004' },
      { name: 'Adajan', pincode: '395005' },
      { name: 'Rander', pincode: '395005' },
      { name: 'Palanpur', pincode: '395009' },
      { name: 'Jahangirpura', pincode: '395009' },
      { name: 'Vesu', pincode: '395007' },
      { name: 'City Light', pincode: '395007' },
      { name: 'Althan', pincode: '395017' },
      { name: 'Bhatar', pincode: '395017' },
      { name: 'Piplod', pincode: '395007' },
      { name: 'Dumas', pincode: '394550' },
      { name: 'Parvat Patiya', pincode: '395010' }
    ],
    'Vadodara': [
      { name: 'Alkapuri', pincode: '390005' },
      { name: 'Race Course', pincode: '390007' },
      { name: 'Gotri', pincode: '390021' },
      { name: 'Manjalpur', pincode: '390011' },
      { name: 'Makarpura', pincode: '390010' },
      { name: 'Tarsali', pincode: '390009' },
      { name: 'Vasna', pincode: '390012' },
      { name: 'Waghodia Road', pincode: '390019' },
      { name: 'Karelibaug', pincode: '390018' },
      { name: 'Fatehgunj', pincode: '390002' },
      { name: 'Sayajigunj', pincode: '390020' },
      { name: 'Subhanpura', pincode: '390023' },
      { name: 'Ellora Park', pincode: '390023' },
      { name: 'Akota', pincode: '390020' },
      { name: 'Sama', pincode: '390024' },
      { name: 'Bhayli', pincode: '390025' },
      { name: 'Sevasi', pincode: '391101' },
      { name: 'Bill', pincode: '391160' },
      { name: 'Padra', pincode: '391440' }
    ],
    'Rajkot': [
      { name: 'Kalavad Road', pincode: '360001' },
      { name: 'University Road', pincode: '360005' },
      { name: 'Raiya Road', pincode: '360007' },
      { name: 'Mavdi', pincode: '360004' },
      { name: 'Gondal Road', pincode: '360002' },
      { name: 'Kothariya Road', pincode: '360022' },
      { name: 'Sadhu Vaswani Road', pincode: '360001' },
      { name: 'Aji Dam', pincode: '360003' },
      { name: 'Madhapar', pincode: '360006' },
      { name: 'Nana Mava', pincode: '360005' }
    ],
    'Bhavnagar': [
      { name: 'Krishnanagar', pincode: '364001' },
      { name: 'Sidsar Road', pincode: '364002' },
      { name: 'Nilambaug', pincode: '364003' },
      { name: 'Kaliyabid', pincode: '364004' },
      { name: 'Ghogha Circle', pincode: '364005' }
    ],
    'Jamnagar': [
      { name: 'Indira Gandhi Marg', pincode: '361001' },
      { name: 'Park Colony', pincode: '361008' },
      { name: 'Digvijay Plot', pincode: '361005' },
      { name: 'Aerodrome Road', pincode: '361006' }
    ],
    'Junagadh': [
      { name: 'Gandhigram', pincode: '362001' },
      { name: 'Joshipura', pincode: '362002' },
      { name: 'Zanzarda Road', pincode: '362015' },
      { name: 'Girnar Road', pincode: '362004' }
    ],
    'Anand': [
      { name: 'Vallabh Vidyanagar', pincode: '388120' },
      { name: 'GIDC', pincode: '388001' },
      { name: 'Gamdi', pincode: '388001' },
      { name: 'Karamsad', pincode: '388325' }
    ],
    'Vapi': [
      { name: 'GIDC', pincode: '396195' },
      { name: 'Chala', pincode: '396191' },
      { name: 'Gunjan', pincode: '396193' },
      { name: 'Balitha', pincode: '396191' }
    ]
  };
  return localities;
};

interface Locality {
  name: string;
  pincode: string;
}

scraperRoutes.get('/projects', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const city = req.query.city as string;
  const search = req.query.search as string;
  const pincode = req.query.pincode as string;
  const locality = req.query.locality as string;
  
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
  
  // Apply locality filter
  if (locality) {
    filteredProjects = filteredProjects.filter(p => 
      p.locality && p.locality.toLowerCase() === locality.toLowerCase()
    );
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.projectName.toLowerCase().includes(searchLower) ||
      p.promoterName.toLowerCase().includes(searchLower) ||
      p.reraId.toLowerCase().includes(searchLower) ||
      p.pincode.includes(search) ||
      (p.locality && p.locality.toLowerCase().includes(searchLower))
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

// Get localities for a specific city
scraperRoutes.get('/localities', (req, res) => {
  const city = req.query.city as string;
  const cityLocalities = getCityLocalities();
  
  if (city && cityLocalities[city]) {
    res.json({
      success: true,
      data: {
        city: city,
        localities: cityLocalities[city]
      }
    });
  } else if (!city) {
    // Return all localities for all cities
    res.json({
      success: true,
      data: cityLocalities
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