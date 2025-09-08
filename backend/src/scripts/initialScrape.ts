import { reraScraper } from '../services/reraScraper';
import { logger } from '../utils/logger';

async function performInitialScrape() {
  try {
    logger.info('Starting initial RERA data scrape...');
    
    // Initialize the scraper
    await reraScraper.initialize();
    
    // For initial testing, let's scrape specific projects we know exist
    // Including SWAGAT GLASSGLOW
    const testProjects = [
      'PR/GJ/GANDHINAGAR/GANDHINAGAR/Gandhinagar Municipal Corporation/MAA13163/210324/311231',
      'PR/GJ/AHMEDABAD/AHMEDABAD/RAA00444/EX1/150219',
      'PR/GJ/AHMEDABAD/SANAND/RAA00171/EX1/050519'
    ];

    const projects = [];
    
    for (const reraId of testProjects) {
      logger.info(`Fetching project: ${reraId}`);
      const project = await reraScraper.getProjectDetails(reraId);
      
      if (project) {
        projects.push(project);
        logger.info(`Successfully fetched: ${project.projectName}`);
      } else {
        logger.warn(`Could not fetch project: ${reraId}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Now search for projects in key districts
    const districts = ['Gandhinagar', 'Ahmedabad'];
    
    for (const district of districts) {
      logger.info(`Searching projects in ${district}...`);
      
      const districtProjects = await reraScraper.searchProjects({ 
        district,
        page: 1 
      });
      
      logger.info(`Found ${districtProjects.length} projects in ${district}`);
      
      // Get details for first 5 projects from each district
      for (let i = 0; i < Math.min(5, districtProjects.length); i++) {
        const project = districtProjects[i];
        if (project && project.reraId) {
          const details = await reraScraper.getProjectDetails(project.reraId);
          if (details) {
            projects.push(details);
            logger.info(`Added: ${details.projectName} from ${district}`);
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Save the scraped data
    await reraScraper.saveData(projects);
    
    logger.info(`Initial scrape complete! Saved ${projects.length} projects.`);
    
    // Cleanup
    await reraScraper.cleanup();
    
    process.exit(0);

  } catch (error) {
    logger.error('Initial scrape failed:', error);
    process.exit(1);
  }
}

// Run the scrape
performInitialScrape();