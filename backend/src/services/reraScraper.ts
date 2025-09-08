import puppeteer, { Browser } from 'puppeteer';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

interface ProjectDetails {
  projectName: string;
  promoterName: string;
  projectType: string;
  district: string;
  locality?: string;
  pincode?: string;
  reraId: string;
  approvedOn?: string;
  completionDate?: string;
  totalUnits?: number;
  availableUnits?: number;
  bookingPercentage?: number;
  price?: string;
  address?: string;
  projectArea?: number;
  totalBuildings?: number;
  status?: string;
}

class RERAGujuratScraper {
  private baseUrl = 'https://gujrera.gujarat.gov.in';
  private dataFile = path.join(process.cwd(), 'rera-data.json');
  private browser: Browser | null = null;

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('RERA scraper initialized');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
    }
  }

  async searchProjects(searchParams: {
    district?: string;
    projectName?: string;
    promoterName?: string;
    pincode?: string;
    page?: number;
  }) {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser!.newPage();
      
      // Navigate to RERA Gujarat search page
      await page.goto(`${this.baseUrl}/PublicDashboard`, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try different possible selectors for search
      try {
        // Check if there's a search interface
        const hasSearchForm = await page.$('form') || await page.$('[id*="search"]') || await page.$('[class*="search"]');
        
        if (hasSearchForm) {
          // Try to find district dropdown with various selectors
          if (searchParams.district) {
            const districtSelectors = [
              '#ddlDistrict',
              'select[name*="district"]',
              'select[id*="district"]',
              '[name="ddlDistrict"]'
            ];
            
            for (const selector of districtSelectors) {
              const element = await page.$(selector);
              if (element) {
                await page.select(selector, searchParams.district);
                break;
              }
            }
          }

          // Try to find and click search button
          const searchButtonSelectors = [
            '#btnSearch',
            'button[type="submit"]',
            'input[type="submit"]',
            '[id*="search"]',
            '[value*="Search"]'
          ];
          
          for (const selector of searchButtonSelectors) {
            const element = await page.$(selector);
            if (element) {
              await element.click();
              await new Promise(resolve => setTimeout(resolve, 3000));
              break;
            }
          }
        }
      } catch (e) {
        logger.warn('Could not interact with search form, trying to extract visible projects');
      }

      // Extract project list with various possible structures
      const projects = await page.evaluate(() => {
        const results: any[] = [];
        
        // Try table-based structure
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach((row: Element) => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length >= 3) {
              const text = cells.map(c => (c as HTMLElement).textContent?.trim() || '').join(' ');
              // Look for RERA registration pattern
              const reraMatch = text.match(/PR\/GJ\/[A-Z]+\/[A-Z]+\/[\w\/]+/);
              if (reraMatch) {
                results.push({
                  projectName: (cells[0] as HTMLElement)?.textContent?.trim() || '',
                  promoterName: (cells[1] as HTMLElement)?.textContent?.trim() || '',
                  district: (cells[2] as HTMLElement)?.textContent?.trim() || '',
                  projectType: (cells[3] as HTMLElement)?.textContent?.trim() || 'Residential',
                  reraId: reraMatch[0],
                  status: 'Registered'
                });
              }
            }
          });
        });

        // Try card/div based structure
        const cards = document.querySelectorAll('[class*="project"], [class*="card"], [class*="listing"]');
        cards.forEach((card: Element) => {
          const text = (card as HTMLElement).textContent || '';
          const reraMatch = text.match(/PR\/GJ\/[A-Z]+\/[A-Z]+\/[\w\/]+/);
          if (reraMatch) {
            results.push({
              projectName: (card.querySelector('[class*="name"], [class*="title"]') as HTMLElement)?.textContent?.trim() || '',
              promoterName: (card.querySelector('[class*="promoter"], [class*="developer"]') as HTMLElement)?.textContent?.trim() || '',
              reraId: reraMatch[0],
              district: '',
              projectType: 'Residential',
              status: 'Registered'
            });
          }
        });

        // Look for any element containing RERA ID pattern
        if (results.length === 0) {
          const allElements = document.querySelectorAll('*');
          allElements.forEach((element: Element) => {
            const text = (element as HTMLElement).textContent || '';
            const reraMatch = text.match(/PR\/GJ\/[A-Z]+\/[A-Z]+\/[\w\/]+/);
            if (reraMatch && !text.includes('<') && text.length < 500) {
              results.push({
                projectName: '',
                promoterName: '',
                reraId: reraMatch[0],
                district: '',
                projectType: 'Residential',
                status: 'Registered'
              });
            }
          });
        }

        // Remove duplicates based on RERA ID
        const unique = results.filter((item, index, self) =>
          index === self.findIndex((t) => t.reraId === item.reraId)
        );

        return unique;
      });

      await page.close();
      return projects;

    } catch (error) {
      logger.error('Error scraping RERA projects:', error);
      return [];
    }
  }

  async getProjectDetails(reraId: string): Promise<ProjectDetails | null> {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser!.newPage();
      
      // Try different URL patterns for project details
      const urls = [
        `${this.baseUrl}/ProjectDetails?regno=${encodeURIComponent(reraId)}`,
        `${this.baseUrl}/project-details/${encodeURIComponent(reraId)}`,
        `${this.baseUrl}/Home/ProjectDetails/${encodeURIComponent(reraId)}`,
        `${this.baseUrl}/PublicDashboard/ProjectDetails?regno=${encodeURIComponent(reraId)}`
      ];

      let pageLoaded = false;
      for (const url of urls) {
        try {
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          // Check if we got a valid page (not 404 or error)
          const title = await page.title();
          if (!title.toLowerCase().includes('error') && !title.includes('404')) {
            pageLoaded = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!pageLoaded) {
        logger.warn(`Could not load details page for ${reraId}`);
        await page.close();
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract project details with improved logic
      const projectDetails = await page.evaluate((reraIdParam) => {
        const details: any = {
          projectName: '',
          promoterName: '',
          projectType: 'Residential',
          district: '',
          locality: '',
          pincode: '',
          address: '',
          approvedOn: '',
          completionDate: '',
          totalUnits: 0,
          availableUnits: 0,
          projectArea: 0,
          totalBuildings: 0,
          status: 'Registered'
        };

        // Helper function to extract value by label
        const getValueByLabel = (label: string): string => {
          // Try table rows
          const rows = document.querySelectorAll('tr');
          for (const row of Array.from(rows)) {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 2) {
              const cellText = (cells[0] as HTMLElement).textContent?.toLowerCase() || '';
              if (cellText.includes(label.toLowerCase())) {
                return (cells[1] as HTMLElement).textContent?.trim() || '';
              }
            }
          }
          
          // Try label-value pairs in divs
          const labels = document.querySelectorAll('label, span, div');
          for (const labelEl of Array.from(labels)) {
            const text = (labelEl as HTMLElement).textContent?.toLowerCase() || '';
            if (text.includes(label.toLowerCase())) {
              const nextEl = labelEl.nextElementSibling as HTMLElement;
              if (nextEl) {
                return nextEl.textContent?.trim() || '';
              }
              const parent = labelEl.parentElement;
              if (parent) {
                const parentText = parent.textContent || '';
                const labelText = (labelEl as HTMLElement).textContent || '';
                return parentText.replace(labelText, '').trim();
              }
            }
          }
          
          return '';
        };

        // Try to extract values
        details.projectName = getValueByLabel('project name') || getValueByLabel('name of project') || 
                             document.querySelector('h1, h2, h3')?.textContent?.trim() || '';
        
        details.promoterName = getValueByLabel('promoter') || getValueByLabel('developer') || 
                              getValueByLabel('builder') || '';
        
        details.district = getValueByLabel('district') || getValueByLabel('city') || '';
        details.locality = getValueByLabel('locality') || getValueByLabel('area') || 
                          getValueByLabel('location') || '';
        
        details.pincode = getValueByLabel('pincode') || getValueByLabel('pin code') || 
                         getValueByLabel('postal code') || '';
        
        details.address = getValueByLabel('address') || getValueByLabel('project address') || 
                         getValueByLabel('site address') || '';
        
        details.projectType = getValueByLabel('project type') || getValueByLabel('type') || 'Residential';
        
        details.approvedOn = getValueByLabel('approval date') || getValueByLabel('approved on') || 
                            getValueByLabel('registration date') || '';
        
        details.completionDate = getValueByLabel('completion date') || getValueByLabel('expected completion') || 
                                getValueByLabel('delivery date') || '';
        
        const unitsStr = getValueByLabel('total units') || getValueByLabel('units') || '0';
        details.totalUnits = parseInt(unitsStr.replace(/\D/g, '')) || 0;
        
        const availStr = getValueByLabel('available units') || getValueByLabel('unsold units') || '0';
        details.availableUnits = parseInt(availStr.replace(/\D/g, '')) || 0;
        
        const areaStr = getValueByLabel('project area') || getValueByLabel('total area') || 
                       getValueByLabel('land area') || '0';
        details.projectArea = parseFloat(areaStr.replace(/[^0-9.]/g, '')) || 0;
        
        const buildingsStr = getValueByLabel('total buildings') || getValueByLabel('towers') || 
                            getValueByLabel('blocks') || '0';
        details.totalBuildings = parseInt(buildingsStr.replace(/\D/g, '')) || 0;
        
        details.status = getValueByLabel('status') || getValueByLabel('project status') || 'Registered';

        // If we still don't have a project name, try to extract from page content
        if (!details.projectName) {
          const pageText = document.body.textContent || '';
          // Look for project name patterns
          const nameMatch = pageText.match(/Project\s*:?\s*([A-Z][A-Za-z\s]+)/i);
          if (nameMatch) {
            details.projectName = nameMatch[1].trim();
          }
        }

        // Generate default values if critical fields are missing
        if (!details.projectName && reraIdParam) {
          // Extract location from RERA ID
          const parts = reraIdParam.split('/');
          if (parts.length > 3) {
            details.district = parts[2];
            details.projectName = `Project in ${parts[3]}`;
          }
        }

        return details;
      }, reraId);

      await page.close();

      // Calculate booking percentage
      let bookingPercentage = 0;
      if (projectDetails.totalUnits && projectDetails.availableUnits !== undefined) {
        const bookedUnits = projectDetails.totalUnits - projectDetails.availableUnits;
        bookingPercentage = Math.round((bookedUnits / projectDetails.totalUnits) * 100);
      }

      return {
        ...projectDetails,
        bookingPercentage,
        reraId
      } as ProjectDetails;

    } catch (error) {
      logger.error(`Error getting project details for ${reraId}:`, error);
      return null;
    }
  }

  async scrapeAllProjects() {
    try {
      const districts = [
        'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
        'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Vadodara'
      ];

      const allProjects: ProjectDetails[] = [];

      for (const district of districts) {
        logger.info(`Scraping projects for ${district}...`);
        
        const projects = await this.searchProjects({ district });
        
        for (const project of projects) {
          if (project && project.reraId) {
            const details = await this.getProjectDetails(project.reraId);
            if (details) {
              allProjects.push(details);
              logger.info(`Scraped: ${details.projectName}`);
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      // Save to file
      await this.saveData(allProjects);
      
      return allProjects;

    } catch (error) {
      logger.error('Error in scrapeAllProjects:', error);
      return [];
    }
  }

  async saveData(data: ProjectDetails[]) {
    try {
      await fs.writeFile(
        this.dataFile,
        JSON.stringify({
          lastUpdated: new Date().toISOString(),
          totalProjects: data.length,
          projects: data
        }, null, 2)
      );
      logger.info(`Saved ${data.length} projects to ${this.dataFile}`);
    } catch (error) {
      logger.error('Error saving data:', error);
    }
  }

  async loadCachedData() {
    try {
      const fileExists = await fs.access(this.dataFile).then(() => true).catch(() => false);
      
      if (!fileExists) {
        logger.info('No cached data found, will scrape fresh data');
        return null;
      }

      const data = await fs.readFile(this.dataFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Check if data is older than 24 hours
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        logger.info('Cached data is older than 24 hours, will refresh');
        return null;
      }

      logger.info(`Loaded ${parsed.projects.length} projects from cache`);
      return parsed;

    } catch (error) {
      logger.error('Error loading cached data:', error);
      return null;
    }
  }

  async getProjects(filters?: {
    district?: string;
    locality?: string;
    projectType?: string;
    searchTerm?: string;
  }) {
    // First try to load cached data
    let data = await this.loadCachedData();
    
    // If no cached data or it's old, scrape fresh
    if (!data) {
      logger.info('Starting fresh scrape of RERA projects...');
      const projects = await this.scrapeAllProjects();
      data = {
        lastUpdated: new Date().toISOString(),
        totalProjects: projects.length,
        projects
      };
    }

    let filteredProjects = data.projects;

    // Apply filters
    if (filters) {
      if (filters.district) {
        filteredProjects = filteredProjects.filter((p: ProjectDetails) => 
          p.district?.toLowerCase() === filters.district?.toLowerCase()
        );
      }

      if (filters.locality) {
        filteredProjects = filteredProjects.filter((p: ProjectDetails) => 
          p.locality?.toLowerCase().includes(filters.locality?.toLowerCase() || '')
        );
      }

      if (filters.projectType) {
        filteredProjects = filteredProjects.filter((p: ProjectDetails) => 
          p.projectType?.toLowerCase().includes(filters.projectType?.toLowerCase() || '')
        );
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredProjects = filteredProjects.filter((p: ProjectDetails) => 
          p.projectName?.toLowerCase().includes(term) ||
          p.promoterName?.toLowerCase().includes(term) ||
          p.locality?.toLowerCase().includes(term) ||
          p.pincode?.includes(term)
        );
      }
    }

    return filteredProjects;
  }

  async getCityStats() {
    const data = await this.loadCachedData();
    
    if (!data) {
      return {};
    }

    const cityStats: Record<string, number> = {};
    
    data.projects.forEach((project: ProjectDetails) => {
      const city = project.district || 'Others';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    return cityStats;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const reraScraper = new RERAGujuratScraper();