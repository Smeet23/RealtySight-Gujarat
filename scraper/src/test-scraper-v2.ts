import { RERAScraperV2 } from './scrapers/reraScraperV2';
import { logger } from './utils/logger';

async function testRERAScraperV2() {
  const scraper = new RERAScraperV2();
  
  try {
    logger.info('Starting RERA Scraper V2 test...');
    
    // Initialize scraper
    await scraper.initialize();
    
    // Test 1: Get city statistics
    logger.info('Test 1: Fetching city-wise statistics...');
    const cityStats = await scraper.getCityStatistics();
    logger.info('City Statistics:', cityStats);
    
    // Test 2: Get projects list for Ahmedabad
    logger.info('Test 2: Fetching Ahmedabad projects list...');
    const projects = await scraper.getProjectsList('Ahmedabad');
    logger.info(`Found ${projects.length} projects in Ahmedabad`);
    
    if (projects.length > 0) {
      // Log first 3 projects
      projects.slice(0, 3).forEach((project, index) => {
        logger.info(`Project ${index + 1}:`, {
          name: project.projectName,
          promoter: project.promoterName,
          type: project.projectType,
          reraId: project.reraProjectId,
          district: project.district,
          approvedOn: project.approvedOn
        });
      });
      
      // Test 3: Get detailed info for a specific project
      if (projects[0].reraProjectId) {
        logger.info('Test 3: Fetching detailed project info...');
        // Construct the project detail URL
        const projectUrl = `https://gujrera.gujarat.gov.in/project-preview/${projects[0].reraProjectId}`;
        const projectDetails = await scraper.getProjectDetails(projectUrl);
        
        if (projectDetails) {
          logger.info('Project Details:', {
            name: projectDetails.projectName,
            bookingPercentage: projectDetails.bookingPercentage,
            unitDetails: projectDetails.unitDetails
          });
        }
      }
    }
    
    logger.info('RERA Scraper V2 test completed successfully!');
    
  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await scraper.close();
  }
}

// Run the test
testRERAScraperV2().catch(console.error);