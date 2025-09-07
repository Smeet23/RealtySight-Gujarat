import puppeteer, { Browser, Page } from 'puppeteer';
import { config } from '../config';
import { logger } from '../utils/logger';
import { delay } from '../utils/helpers';

export interface ProjectInfo {
  reraProjectId: string;
  projectName: string;
  promoterName: string;
  projectType: string;
  district: string;
  emailId?: string;
  mobileNo?: string;
  approvedOn?: string;
  projectEndDate?: string;
  projectExtendedEndDate?: string;
  bookingPercentage?: number;
  unitDetails?: {
    unitType: string;
    totalUnits: number;
    bookedUnits: number;
    unbookedUnits: number;
  }[];
}

export class RERAScraperV2 {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Set to true in production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Remove in production
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setUserAgent(config.scraping.userAgent);
      
      logger.info('RERA Scraper V2 initialized');
    } catch (error) {
      logger.error('Failed to initialize scraper:', error);
      throw error;
    }
  }

  async getProjectsList(city: string = 'Ahmedabad'): Promise<ProjectInfo[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized');
    }

    try {
      logger.info(`Fetching projects list for ${city}`);
      
      // Navigate to the registered projects page
      const projectsUrl = 'https://gujrera.gujarat.gov.in/home-p/registered-project-listing';
      await this.page.goto(projectsUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await delay(3000);

      // Wait for the table to load
      await this.page.waitForSelector('table', { timeout: 10000 }).catch(() => {
        logger.warn('Table not found, page might be loading');
      });

      // Extract project data from the table
      const projects = await this.page.evaluate((targetCity) => {
        const rows = document.querySelectorAll('table tbody tr');
        const projectsList: any[] = [];

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 10) {
            const district = cells[7]?.textContent?.trim() || '';
            
            // Filter by city if it matches
            if (!targetCity || district.toLowerCase().includes(targetCity.toLowerCase())) {
              projectsList.push({
                projectName: cells[1]?.textContent?.trim() || '',
                promoterName: cells[2]?.textContent?.trim() || '',
                projectType: cells[4]?.textContent?.trim() || '',
                emailId: cells[5]?.textContent?.trim() || '',
                mobileNo: cells[6]?.textContent?.trim() || '',
                reraProjectId: cells[8]?.textContent?.trim() || '',
                district: district,
                approvedOn: cells[9]?.textContent?.trim() || '',
                projectEndDate: cells[10]?.textContent?.trim() || '',
                projectExtendedEndDate: cells[11]?.textContent?.trim() || ''
              });
            }
          }
        });

        return projectsList;
      }, city);

      logger.info(`Found ${projects.length} projects in ${city}`);
      return projects;

    } catch (error) {
      logger.error(`Error fetching projects list:`, error);
      return [];
    }
  }

  async getProjectDetails(projectUrl: string): Promise<ProjectInfo | null> {
    if (!this.page) {
      throw new Error('Scraper not initialized');
    }

    try {
      logger.info(`Fetching project details from ${projectUrl}`);
      
      await this.page.goto(projectUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await delay(2000);

      // Extract project details
      const projectDetails = await this.page.evaluate(() => {
        const details: any = {};

        // Get basic project info
        const projectNameEl = document.querySelector('td:contains("Project Name") + td');
        if (projectNameEl) {
          details.projectName = projectNameEl.textContent?.trim();
        }

        // Get RERA registration number
        const reraNoEl = document.querySelector('td:contains("GUJRERA Reg. No.") + td');
        if (reraNoEl) {
          details.reraProjectId = reraNoEl.textContent?.trim();
        }

        // Get booking status from the chart
        const bookingChart = document.querySelector('.highcharts-container');
        if (bookingChart) {
          // Extract percentages from chart labels
          const percentages = Array.from(document.querySelectorAll('.highcharts-data-label text'))
            .map(el => el.textContent?.replace('%', '').trim())
            .filter(Boolean)
            .map(Number);
          
          if (percentages.length > 0) {
            details.bookingPercentage = Math.round(
              percentages.reduce((a, b) => a + b, 0) / percentages.length
            );
          }
        }

        // Get unit details from the table
        const unitRows = document.querySelectorAll('table tr');
        const units: any[] = [];
        
        unitRows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4 && cells[0].textContent?.includes('Residential')) {
            units.push({
              unitType: cells[0].textContent?.trim(),
              totalUnits: parseInt(cells[2].textContent?.trim() || '0'),
              bookedUnits: parseInt(cells[3].textContent?.trim() || '0'),
              unbookedUnits: parseInt(cells[4].textContent?.trim() || '0')
            });
          }
        });

        details.unitDetails = units;
        
        return details;
      });

      return projectDetails as ProjectInfo;

    } catch (error) {
      logger.error(`Error fetching project details:`, error);
      return null;
    }
  }

  async getCityStatistics(): Promise<Record<string, number>> {
    if (!this.page) {
      throw new Error('Scraper not initialized');
    }

    try {
      logger.info('Fetching city-wise statistics');
      
      // Navigate to the main page with statistics
      await this.page.goto('https://gujrera.gujarat.gov.in', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await delay(3000);

      // Extract city statistics from the table
      const stats = await this.page.evaluate(() => {
        const cityStats: Record<string, number> = {};
        
        // Look for the statistics table
        const rows = document.querySelectorAll('table tr');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const cityName = cells[0]?.textContent?.trim();
            const count = cells[1]?.textContent?.trim();
            
            if (cityName && count) {
              cityStats[cityName] = parseInt(count.replace(/,/g, '')) || 0;
            }
          }
        });

        // If no table found, look for specific city counts
        const ahmedabadEl = document.querySelector('td:contains("Ahmedabad") + td');
        if (ahmedabadEl) {
          cityStats['Ahmedabad'] = parseInt(ahmedabadEl.textContent?.replace(/,/g, '') || '0');
        }

        return cityStats;
      });

      logger.info('City statistics:', stats);
      return stats;

    } catch (error) {
      logger.error('Error fetching city statistics:', error);
      return {};
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('RERA Scraper V2 closed');
    }
  }
}