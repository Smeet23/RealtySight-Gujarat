import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

interface ProjectData {
  projectName: string;
  promoterName: string;
  projectType: string;
  district: string;
  locality: string;
  pincode: string;
  address: string;
  approvedOn: string;
  completionDate: string;
  totalUnits: number;
  availableUnits: number;
  projectArea: number;
  totalBuildings: number;
  status: string;
  bookingPercentage: number;
  reraId: string;
}

class RealRERAScraper {
  private browser: Browser | null = null;
  private baseUrl = 'https://gujrera.gujarat.gov.in';
  private dataFile = path.join(process.cwd(), 'rera-data.json');
  
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser to see what's happening
        slowMo: 100, // Slow down actions to appear more human-like
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-sync'
        ],
        defaultViewport: null // Use full screen
      });
      
      logger.info('🚀 Real RERA scraper initialized');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async createStealthPage(): Promise<Page> {
    const page = await this.browser!.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    // Set realistic headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    });

    // Remove webdriver traces
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Mock chrome object
      (window as any).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ],
      });
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission } as any) :
        originalQuery(parameters)
      );
    });
    
    return page;
  }

  async randomDelay(min: number = 2000, max: number = 5000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async humanType(page: Page, selector: string, text: string) {
    await page.click(selector);
    await this.randomDelay(500, 1000);
    
    // Clear existing text
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    // Type with human-like delays
    for (const char of text) {
      await page.keyboard.type(char);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
  }

  async scrapeRealProjects(): Promise<ProjectData[]> {
    const page = await this.createStealthPage();
    const allProjects: ProjectData[] = [];
    
    try {
      logger.info('🌐 Navigating to RERA Gujarat website...');
      
      // Navigate to the main website first
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });
      
      await this.randomDelay(3000, 5000);
      
      // Take a screenshot to see the page
      await page.screenshot({ path: 'rera-homepage.png', fullPage: true });
      logger.info('📸 Screenshot saved: rera-homepage.png');
      
      // Look for the public dashboard or project search link
      logger.info('🔍 Looking for project search functionality...');
      
      const dashboardSelectors = [
        'a[href*="PublicDashboard"]',
        'a[href*="public"]',
        'a[href*="search"]',
        'a[href*="project"]',
        '[onclick*="PublicDashboard"]',
        'text/Public Dashboard',
        'text/Search Projects',
        'text/Project Search'
      ];
      
      let dashboardFound = false;
      for (const selector of dashboardSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            logger.info(`✅ Found dashboard link: ${selector}`);
            await element.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            dashboardFound = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!dashboardFound) {
        // Try direct URL
        logger.info('🔗 Trying direct PublicDashboard URL...');
        await page.goto(`${this.baseUrl}/PublicDashboard`, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
      }
      
      await this.randomDelay(2000, 4000);
      await page.screenshot({ path: 'rera-dashboard.png', fullPage: true });
      logger.info('📸 Dashboard screenshot saved: rera-dashboard.png');
      
      // Now look for search forms or project listings
      logger.info('📋 Extracting project data...');
      
      // Check if there's a search form
      const searchForm = await page.$('form');
      
      if (searchForm) {
        logger.info('📝 Found search form, trying different searches...');
        
        // Try searching without any filters first to get all projects
        const searchButton = await page.$('input[type="submit"], button[type="submit"]');
        if (searchButton) {
          await searchButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
          await this.randomDelay(3000, 5000);
        }
      }
      
      // Extract projects from current page
      const projects = await this.extractProjectsFromCurrentPage(page);
      allProjects.push(...projects);
      
      // Look for pagination or "Next" buttons
      let currentPage = 1;
      const maxPages = 10; // Limit for safety
      
      while (currentPage < maxPages) {
        logger.info(`📄 Checking page ${currentPage + 1}...`);
        
        const nextButton = await page.$('a[href*="page"], input[value*="Next"], button:contains("Next"), a:contains("Next")');
        
        if (!nextButton) {
          logger.info('📄 No more pages found');
          break;
        }
        
        try {
          await nextButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
          await this.randomDelay(2000, 4000);
          
          const pageProjects = await this.extractProjectsFromCurrentPage(page);
          if (pageProjects.length === 0) {
            logger.info('📄 No projects found on this page, stopping pagination');
            break;
          }
          
          allProjects.push(...pageProjects);
          currentPage++;
          
        } catch (error) {
          logger.info('📄 Pagination ended');
          break;
        }
      }
      
      await page.close();
      
    } catch (error) {
      logger.error('❌ Error during scraping:', error);
      await page.close();
    }
    
    // Remove duplicates based on RERA ID
    const uniqueProjects = allProjects.filter((project, index, self) =>
      project.reraId && index === self.findIndex(p => p.reraId === project.reraId)
    );
    
    logger.info(`✅ Found ${uniqueProjects.length} unique real projects`);
    return uniqueProjects;
  }

  async extractProjectsFromCurrentPage(page: Page): Promise<ProjectData[]> {
    try {
      logger.info('🔍 Extracting projects from current page...');
      
      const projects = await page.evaluate(() => {
        const results: any[] = [];
        
        // Look for tables with project data
        const tables = Array.from(document.querySelectorAll('table'));
        
        for (const table of tables) {
          // Check if this table contains RERA data
          const tableText = table.textContent?.toLowerCase() || '';
          if (!tableText.includes('rera') && !tableText.includes('project') && !tableText.includes('promoter')) {
            continue;
          }
          
          const rows = Array.from(table.querySelectorAll('tbody tr, tr')).slice(1); // Skip header
          
          for (const row of rows) {
            const cells = Array.from(row.querySelectorAll('td, th'));
            if (cells.length < 3) continue;
            
            const cellTexts = cells.map(cell => (cell as HTMLElement).textContent?.trim() || '');
            const rowText = cellTexts.join(' ');
            
            // Look for RERA ID pattern
            const reraMatch = rowText.match(/PR\/GJ\/[A-Z0-9\/]+/);
            if (!reraMatch) continue;
            
            const project: any = {
              reraId: reraMatch[0],
              projectName: '',
              promoterName: '',
              district: '',
              locality: '',
              pincode: '',
              address: '',
              projectType: 'Residential',
              status: 'Registered',
              approvedOn: '',
              completionDate: '',
              totalUnits: 0,
              availableUnits: 0,
              projectArea: 0,
              totalBuildings: 0,
              bookingPercentage: 0
            };
            
            // Try to map cell data based on content patterns
            cellTexts.forEach((text) => {
              if (!text || text === reraMatch[0]) return;
              
              // Project name (usually first non-RERA cell with reasonable length)
              if (!project.projectName && text.length > 5 && text.length < 100 && !text.includes('Ltd') && !text.includes('Pvt')) {
                project.projectName = text;
              }
              // Promoter name (usually contains Ltd, Pvt, Group, Developers, etc.)
              else if (!project.promoterName && (text.includes('Ltd') || text.includes('Pvt') || text.includes('Group') || text.includes('Developer') || text.includes('Builder'))) {
                project.promoterName = text;
              }
              // District
              else if (text.match(/^(Gandhinagar|Ahmedabad|Surat|Vadodara|Rajkot|Bhavnagar|Jamnagar)$/i)) {
                project.district = text;
              }
              // Pincode
              else if (text.match(/^\d{6}$/)) {
                project.pincode = text;
              }
              // Date patterns
              else if (text.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/)) {
                if (!project.approvedOn) {
                  project.approvedOn = text;
                } else if (!project.completionDate) {
                  project.completionDate = text;
                }
              }
              // Numbers for units, area, etc.
              else if (text.match(/^\d+$/) && parseInt(text) > 0) {
                const num = parseInt(text);
                if (num < 10000 && !project.totalUnits) {
                  project.totalUnits = num;
                } else if (num > 10000 && !project.projectArea) {
                  project.projectArea = num;
                }
              }
            });
            
            // Extract district from RERA ID if not found
            if (!project.district && reraMatch[0]) {
              const reraParts = reraMatch[0].split('/');
              if (reraParts.length > 2) {
                project.district = reraParts[2];
              }
            }
            
            // Set default project name if empty
            if (!project.projectName) {
              project.projectName = `Project ${reraMatch[0].split('/').pop()}`;
            }
            
            // Set default promoter name if empty
            if (!project.promoterName) {
              project.promoterName = 'Developer Name Not Available';
            }
            
            results.push(project);
          }
        }
        
        // Also look for div-based layouts
        const projectDivs = Array.from(document.querySelectorAll('div[class*="project"], div[class*="card"], div[class*="listing"]'));
        
        for (const div of projectDivs) {
          const text = div.textContent || '';
          const reraMatch = text.match(/PR\/GJ\/[A-Z0-9\/]+/);
          
          if (reraMatch) {
            const project = {
              reraId: reraMatch[0],
              projectName: (div.querySelector('[class*="name"], [class*="title"], h1, h2, h3') as HTMLElement)?.textContent?.trim() || `Project ${reraMatch[0].split('/').pop()}`,
              promoterName: (div.querySelector('[class*="promoter"], [class*="developer"], [class*="builder"]') as HTMLElement)?.textContent?.trim() || 'Developer Name Not Available',
              district: reraMatch[0].split('/')[2] || '',
              locality: '',
              pincode: '',
              address: '',
              projectType: 'Residential',
              status: 'Registered',
              approvedOn: '',
              completionDate: '',
              totalUnits: 0,
              availableUnits: 0,
              projectArea: 0,
              totalBuildings: 0,
              bookingPercentage: 0
            };
            
            results.push(project);
          }
        }
        
        return results;
      });
      
      logger.info(`🎯 Extracted ${projects.length} projects from current page`);
      
      return projects.map(p => ({
        ...p,
        bookingPercentage: p.totalUnits > 0 && p.availableUnits > 0 ? 
          Math.round(((p.totalUnits - p.availableUnits) / p.totalUnits) * 100) : 0
      }));
      
    } catch (error) {
      logger.error('❌ Error extracting projects:', error);
      return [];
    }
  }

  async saveData(projects: ProjectData[]) {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        totalProjects: projects.length,
        projects
      };
      
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      logger.info(`💾 Saved ${projects.length} REAL projects to database`);
      
      // Print city-wise summary
      const cityStats: Record<string, number> = {};
      projects.forEach(p => {
        if (p.district) {
          cityStats[p.district] = (cityStats[p.district] || 0) + 1;
        }
      });
      
      console.log('\n🏗️  REAL RERA Projects Database');
      console.log('================================');
      Object.entries(cityStats).forEach(([city, count]) => {
        console.log(`📍 ${city}: ${count} projects`);
      });
      console.log(`📊 Total REAL projects: ${projects.length}`);
      console.log('================================\n');
      
    } catch (error) {
      logger.error('❌ Error saving data:', error);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('🔚 Browser closed');
    }
  }

  async run() {
    try {
      await this.initialize();
      
      logger.info('🚀 Starting REAL RERA project scraping...');
      logger.info('⚠️  This will open a browser window - DO NOT close it manually');
      
      const projects = await this.scrapeRealProjects();
      
      if (projects.length > 0) {
        await this.saveData(projects);
        logger.info('✅ Real data scraping completed successfully!');
      } else {
        logger.warn('⚠️  No real projects found - website may have changed or be blocking access');
      }
      
      await this.cleanup();
      
    } catch (error) {
      logger.error('❌ Real RERA scraping failed:', error);
      await this.cleanup();
      throw error;
    }
  }
}

// Run the real scraper
async function main() {
  const scraper = new RealRERAScraper();
  try {
    await scraper.run();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Scraping process failed:', error);
    process.exit(1);
  }
}

main();