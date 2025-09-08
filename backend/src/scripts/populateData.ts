import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

// Realistic Gujarat RERA project data
const gujaratProjects = [
  // Gandhinagar Projects
  {
    projectName: "Swagat GlassGlow",
    promoterName: "Swagat Group",
    projectType: "Residential",
    district: "Gandhinagar",
    locality: "Kudasan",
    pincode: "382421",
    address: "Near GIFT City, Kudasan, Gandhinagar",
    approvedOn: "21-03-2024",
    completionDate: "31-12-2031",
    totalUnits: 450,
    availableUnits: 320,
    projectArea: 25000,
    totalBuildings: 8,
    status: "Registered",
    bookingPercentage: 29,
    reraId: "PR/GJ/GANDHINAGAR/GANDHINAGAR/Gandhinagar Municipal Corporation/MAA13163/210324/311231"
  },
  {
    projectName: "Satyam Skyline",
    promoterName: "Satyam Developers",
    projectType: "Residential",
    district: "Gandhinagar",
    locality: "Sargasan",
    pincode: "382421",
    address: "Sargasan Circle, Near GIFT City",
    approvedOn: "15-02-2024",
    completionDate: "30-06-2029",
    totalUnits: 280,
    availableUnits: 180,
    projectArea: 18000,
    totalBuildings: 4,
    status: "Registered",
    bookingPercentage: 36,
    reraId: "PR/GJ/GANDHINAGAR/GANDHINAGAR/SGC/MAA12890/150224/300629"
  },
  {
    projectName: "Shivalik Heights",
    promoterName: "Shivalik Buildcon",
    projectType: "Residential",
    district: "Gandhinagar",
    locality: "Raysan",
    pincode: "382007",
    address: "Raysan Village, Gandhinagar",
    approvedOn: "10-01-2024",
    completionDate: "31-12-2028",
    totalUnits: 360,
    availableUnits: 240,
    projectArea: 22000,
    totalBuildings: 6,
    status: "Registered",
    bookingPercentage: 33,
    reraId: "PR/GJ/GANDHINAGAR/GANDHINAGAR/RVC/MAA12745/100124/311228"
  },
  {
    projectName: "Akshar Orchid",
    promoterName: "Akshar Group",
    projectType: "Residential",
    district: "Gandhinagar",
    locality: "Vavol",
    pincode: "382016",
    address: "Vavol Cross Roads, Gandhinagar",
    approvedOn: "05-03-2024",
    completionDate: "30-09-2029",
    totalUnits: 420,
    availableUnits: 350,
    projectArea: 28000,
    totalBuildings: 7,
    status: "Registered",
    bookingPercentage: 17,
    reraId: "PR/GJ/GANDHINAGAR/GANDHINAGAR/VCR/MAA13001/050324/300929"
  },
  
  // Ahmedabad Projects
  {
    projectName: "Godrej Garden City",
    promoterName: "Godrej Properties",
    projectType: "Residential",
    district: "Ahmedabad",
    locality: "SG Highway",
    pincode: "380054",
    address: "Near Karnavati Club, SG Highway",
    approvedOn: "15-02-2019",
    completionDate: "31-12-2025",
    totalUnits: 1200,
    availableUnits: 280,
    projectArea: 65000,
    totalBuildings: 15,
    status: "Registered",
    bookingPercentage: 77,
    reraId: "PR/GJ/AHMEDABAD/AHMEDABAD/RAA00444/EX1/150219"
  },
  {
    projectName: "Sun Sky Park",
    promoterName: "Sun Builders",
    projectType: "Residential",
    district: "Ahmedabad",
    locality: "Bopal",
    pincode: "380058",
    address: "Bopal-Ghuma Road, Bopal",
    approvedOn: "20-06-2023",
    completionDate: "30-06-2027",
    totalUnits: 560,
    availableUnits: 320,
    projectArea: 35000,
    totalBuildings: 8,
    status: "Registered",
    bookingPercentage: 43,
    reraId: "PR/GJ/AHMEDABAD/BOPAL/RAA11234/200623/300627"
  },
  {
    projectName: "Shela One",
    promoterName: "Shivalik Group",
    projectType: "Commercial",
    district: "Ahmedabad",
    locality: "Shela",
    pincode: "380059",
    address: "Shela Circle, Near BRTS",
    approvedOn: "10-08-2023",
    completionDate: "31-03-2026",
    totalUnits: 180,
    availableUnits: 90,
    projectArea: 12000,
    totalBuildings: 2,
    status: "Registered",
    bookingPercentage: 50,
    reraId: "PR/GJ/AHMEDABAD/SHELA/RAA11456/100823/310326"
  },
  {
    projectName: "Binori Pristine",
    promoterName: "Binori Group",
    projectType: "Residential",
    district: "Ahmedabad",
    locality: "South Bopal",
    pincode: "380058",
    address: "South Bopal, Near Iscon Ambli Road",
    approvedOn: "05-05-2019",
    completionDate: "31-12-2024",
    totalUnits: 380,
    availableUnits: 45,
    projectArea: 22000,
    totalBuildings: 4,
    status: "Registered",
    bookingPercentage: 88,
    reraId: "PR/GJ/AHMEDABAD/SANAND/RAA00171/EX1/050519"
  },
  {
    projectName: "Safal Parishkaar",
    promoterName: "Safal Group",
    projectType: "Residential",
    district: "Ahmedabad",
    locality: "Prahlad Nagar",
    pincode: "380015",
    address: "100ft Road, Prahlad Nagar",
    approvedOn: "15-09-2023",
    completionDate: "30-09-2027",
    totalUnits: 320,
    availableUnits: 180,
    projectArea: 18000,
    totalBuildings: 3,
    status: "Registered",
    bookingPercentage: 44,
    reraId: "PR/GJ/AHMEDABAD/PRAHLAD/RAA11678/150923/300927"
  },
  {
    projectName: "Ganesh Genesis",
    promoterName: "Ganesh Housing",
    projectType: "Residential",
    district: "Ahmedabad",
    locality: "Gota",
    pincode: "382481",
    address: "Gota Cross Roads, Near Vaishnodevi Circle",
    approvedOn: "25-11-2023",
    completionDate: "31-12-2028",
    totalUnits: 480,
    availableUnits: 360,
    projectArea: 32000,
    totalBuildings: 6,
    status: "Registered",
    bookingPercentage: 25,
    reraId: "PR/GJ/AHMEDABAD/GOTA/RAA11890/251123/311228"
  },
  
  // Surat Projects
  {
    projectName: "Dream Heritage",
    promoterName: "Dream Group",
    projectType: "Residential",
    district: "Surat",
    locality: "Vesu",
    pincode: "395007",
    address: "VIP Road, Vesu",
    approvedOn: "10-07-2023",
    completionDate: "30-06-2027",
    totalUnits: 640,
    availableUnits: 420,
    projectArea: 38000,
    totalBuildings: 8,
    status: "Registered",
    bookingPercentage: 34,
    reraId: "PR/GJ/SURAT/VESU/RSU10234/100723/300627"
  },
  {
    projectName: "Shree Rang Residency",
    promoterName: "Shree Rang Developers",
    projectType: "Residential",
    district: "Surat",
    locality: "Althan",
    pincode: "395017",
    address: "Canal Road, Althan",
    approvedOn: "20-08-2023",
    completionDate: "31-03-2028",
    totalUnits: 380,
    availableUnits: 280,
    projectArea: 24000,
    totalBuildings: 5,
    status: "Registered",
    bookingPercentage: 26,
    reraId: "PR/GJ/SURAT/ALTHAN/RSU10456/200823/310328"
  },
  {
    projectName: "Happy Home Elanza",
    promoterName: "Happy Home Group",
    projectType: "Residential",
    district: "Surat",
    locality: "Adajan",
    pincode: "395009",
    address: "Pal-Adajan Road, Adajan",
    approvedOn: "15-06-2023",
    completionDate: "30-09-2027",
    totalUnits: 520,
    availableUnits: 340,
    projectArea: 30000,
    totalBuildings: 7,
    status: "Registered",
    bookingPercentage: 35,
    reraId: "PR/GJ/SURAT/ADAJAN/RSU10123/150623/300927"
  },
  
  // Vadodara Projects
  {
    projectName: "Alembic Urban Forest",
    promoterName: "Alembic Group",
    projectType: "Residential",
    district: "Vadodara",
    locality: "Gorwa",
    pincode: "390016",
    address: "Gorwa Road, Near Vrundavan",
    approvedOn: "10-05-2023",
    completionDate: "31-12-2027",
    totalUnits: 480,
    availableUnits: 320,
    projectArea: 35000,
    totalBuildings: 6,
    status: "Registered",
    bookingPercentage: 33,
    reraId: "PR/GJ/VADODARA/GORWA/RVD09876/100523/311227"
  },
  {
    projectName: "Sakar Heights",
    promoterName: "Sakar Developers",
    projectType: "Residential",
    district: "Vadodara",
    locality: "Alkapuri",
    pincode: "390007",
    address: "Near Sardar Estate, Alkapuri",
    approvedOn: "25-07-2023",
    completionDate: "30-06-2028",
    totalUnits: 280,
    availableUnits: 180,
    projectArea: 18000,
    totalBuildings: 3,
    status: "Registered",
    bookingPercentage: 36,
    reraId: "PR/GJ/VADODARA/ALKAPURI/RVD10234/250723/300628"
  },
  {
    projectName: "Suncity Platinum",
    promoterName: "Suncity Developers",
    projectType: "Residential",
    district: "Vadodara",
    locality: "Vasna",
    pincode: "390007",
    address: "Vasna-Bhayli Road, Vasna",
    approvedOn: "30-09-2023",
    completionDate: "31-03-2029",
    totalUnits: 560,
    availableUnits: 420,
    projectArea: 42000,
    totalBuildings: 8,
    status: "Registered",
    bookingPercentage: 25,
    reraId: "PR/GJ/VADODARA/VASNA/RVD10567/300923/310329"
  },
  
  // Rajkot Projects
  {
    projectName: "Akshar Elegance",
    promoterName: "Akshar Developers",
    projectType: "Residential",
    district: "Rajkot",
    locality: "Kalawad Road",
    pincode: "360001",
    address: "Near KKV Hall, Kalawad Road",
    approvedOn: "15-04-2023",
    completionDate: "30-06-2027",
    totalUnits: 320,
    availableUnits: 200,
    projectArea: 22000,
    totalBuildings: 4,
    status: "Registered",
    bookingPercentage: 38,
    reraId: "PR/GJ/RAJKOT/KALAWAD/RRJ08765/150423/300627"
  },
  {
    projectName: "Radhe Heights",
    promoterName: "Radhe Developers",
    projectType: "Residential",
    district: "Rajkot",
    locality: "University Road",
    pincode: "360005",
    address: "Near RK University, University Road",
    approvedOn: "20-06-2023",
    completionDate: "31-12-2028",
    totalUnits: 420,
    availableUnits: 320,
    projectArea: 28000,
    totalBuildings: 5,
    status: "Registered",
    bookingPercentage: 24,
    reraId: "PR/GJ/RAJKOT/UNIVERSITY/RRJ09123/200623/311228"
  },
  {
    projectName: "Shivam Residency",
    promoterName: "Shivam Group",
    projectType: "Residential",
    district: "Rajkot",
    locality: "Raiya Road",
    pincode: "360007",
    address: "Near Big Bazaar, Raiya Road",
    approvedOn: "10-08-2023",
    completionDate: "30-09-2028",
    totalUnits: 240,
    availableUnits: 160,
    projectArea: 15000,
    totalBuildings: 3,
    status: "Registered",
    bookingPercentage: 33,
    reraId: "PR/GJ/RAJKOT/RAIYA/RRJ09456/100823/300928"
  }
];

async function populateData() {
  try {
    const dataFile = path.join(process.cwd(), 'rera-data.json');
    
    logger.info(`Populating RERA data with ${gujaratProjects.length} projects...`);
    
    const data = {
      lastUpdated: new Date().toISOString(),
      totalProjects: gujaratProjects.length,
      projects: gujaratProjects
    };
    
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    
    logger.info(`Successfully populated ${gujaratProjects.length} projects to rera-data.json`);
    
    // Print summary
    const cityStats: Record<string, number> = {};
    gujaratProjects.forEach(project => {
      cityStats[project.district] = (cityStats[project.district] || 0) + 1;
    });
    
    console.log('\nProject Summary:');
    console.log('================');
    Object.entries(cityStats).forEach(([city, count]) => {
      console.log(`${city}: ${count} projects`);
    });
    console.log(`Total: ${gujaratProjects.length} projects`);
    
  } catch (error) {
    logger.error('Failed to populate data:', error);
    process.exit(1);
  }
}

// Run the population script
populateData();