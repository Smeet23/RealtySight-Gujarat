import { RERAScraper } from './scrapers/reraScraper';
import { logger } from './utils/logger';
import { config } from './config';

async function testRERAScraper() {
  const scraper = new RERAScraper();
  
  try {
    logger.info('Starting RERA scraper test...');
    
    // Initialize scraper
    await scraper.initialize();
    
    // Test connection
    logger.info('Testing connection to Gujarat RERA portal...');
    const isConnected = await scraper.testConnection();
    
    if (!isConnected) {
      logger.error('Failed to connect to RERA portal');
      return;
    }
    
    logger.info('Connection successful!');
    
    // Test searching projects in a city
    const testCity = config.cities[0]; // Ahmedabad
    logger.info(`Testing project search for ${testCity}...`);
    
    const projects = await scraper.searchProjects(testCity);
    logger.info(`Found ${projects.length} projects`);
    
    if (projects.length > 0) {
      // Log first few projects
      projects.slice(0, 3).forEach(project => {
        logger.info('Project:', {
          reraId: project.reraProjectId,
          name: project.projectName,
          developer: project.developerName,
          city: project.city,
        });
      });
      
      // Test fetching details for first project
      const firstProject = projects[0];
      logger.info(`Fetching details for project: ${firstProject.reraProjectId}`);
      
      const details = await scraper.getProjectDetails(firstProject.reraProjectId);
      if (details) {
        logger.info('Project details:', {
          name: details.projectName,
          totalUnits: details.totalUnits,
          unitsBooked: details.unitsBooked,
          bookingPercentage: details.bookingPercentage?.toFixed(2) + '%',
          status: details.projectStatus,
        });
      }
    }
    
    logger.info('RERA scraper test completed successfully!');
    
  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await scraper.close();
  }
}

// Run the test
testRERAScraper().catch(console.error);