import puppeteer from 'puppeteer';
import { logger } from './utils/logger';
import { delay } from './utils/helpers';

async function findRERAUrls() {
  let browser = null;
  let page = null;

  try {
    // Launch browser in non-headless mode to see what's happening
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    logger.info('Navigating to Gujarat RERA portal...');
    await page.goto('https://gujrera.gujarat.gov.in', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await delay(3000);

    // Get all links on the page
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a'));
      return allLinks.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href,
        id: link.id,
        className: link.className
      })).filter(link => link.href);
    });

    logger.info(`Found ${links.length} links on the main page`);
    
    // Log relevant links
    const relevantKeywords = ['project', 'search', 'list', 'register', 'view', 'detail', 'promoter', 'builder'];
    const relevantLinks = links.filter(link => 
      relevantKeywords.some(keyword => 
        link.text.toLowerCase().includes(keyword) || 
        link.href.toLowerCase().includes(keyword)
      )
    );

    logger.info('\n=== Relevant Links Found ===');
    relevantLinks.forEach(link => {
      logger.info(`Text: "${link.text}" | URL: ${link.href}`);
    });

    // Look for forms on the page
    const forms = await page.evaluate(() => {
      const allForms = Array.from(document.querySelectorAll('form'));
      return allForms.map(form => ({
        action: form.action,
        method: form.method,
        id: form.id,
        className: form.className,
        inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
          type: (input as HTMLInputElement).type,
          name: (input as HTMLInputElement).name,
          id: input.id,
          placeholder: (input as HTMLInputElement).placeholder || ''
        }))
      }));
    });

    logger.info(`\n=== Forms Found: ${forms.length} ===`);
    forms.forEach((form, index) => {
      logger.info(`Form ${index + 1}: ${form.action || 'no action'}`);
      form.inputs.forEach(input => {
        logger.info(`  - ${input.type}: ${input.name || input.id || 'unnamed'}`);
      });
    });

    // Look for menu items
    const menuItems = await page.evaluate(() => {
      const possibleMenuSelectors = [
        '.menu', '.nav', '.navbar', 
        '[role="navigation"]', 
        'ul.menu', 'ul.nav',
        '.dropdown', '.submenu'
      ];
      
      const menus: any[] = [];
      possibleMenuSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const links = el.querySelectorAll('a');
          if (links.length > 0) {
            menus.push({
              selector,
              items: Array.from(links).map(link => ({
                text: link.textContent?.trim(),
                href: link.href
              }))
            });
          }
        });
      });
      
      return menus;
    });

    if (menuItems.length > 0) {
      logger.info('\n=== Menu Items Found ===');
      menuItems.forEach(menu => {
        logger.info(`Menu (${menu.selector}):`);
        menu.items.forEach((item: any) => {
          logger.info(`  - ${item.text}: ${item.href}`);
        });
      });
    }

    // Check for Angular/React routing
    const isAngular = await page.evaluate(() => {
      return !!(window as any).ng || document.querySelector('[ng-app]') !== null;
    });

    const isReact = await page.evaluate(() => {
      return document.querySelector('#root') !== null || document.querySelector('[data-reactroot]') !== null;
    });

    logger.info(`\n=== Framework Detection ===`);
    logger.info(`Angular detected: ${isAngular}`);
    logger.info(`React detected: ${isReact}`);

    // Try to find project listing by clicking on menu items
    logger.info('\n=== Attempting to find project listings ===');
    
    // Look for "Project" related links
    const projectLink = await page.$('a[href*="project" i], a:contains("Project"), a:contains("Search")');
    if (projectLink) {
      logger.info('Found project-related link, clicking...');
      await projectLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
        logger.info('Navigation timeout, checking current page...');
      });
      
      const newUrl = page.url();
      logger.info(`Current URL after click: ${newUrl}`);
    }

    logger.info('\n=== Analysis Complete ===');

  } catch (error) {
    logger.error('Error finding URLs:', error);
  } finally {
    if (browser) {
      await delay(5000); // Keep browser open for manual inspection
      await browser.close();
    }
  }
}

findRERAUrls().catch(console.error);