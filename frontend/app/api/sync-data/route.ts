import { NextRequest, NextResponse } from 'next/server';
import { saveProjects, updateCityStats, recordFetch, initDatabase } from '@/lib/postgres';

async function fetchWithNode(url: string) {
  const https = require('https');
  
  return new Promise<string>((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      rejectUnauthorized: false,
      timeout: 30000
    };
    
    https.get(url, options, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Main cities in Gujarat
const GUJARAT_CITIES = [
  'Ahmedabad',
  'Surat', 
  'Vadodara',
  'Rajkot',
  'Gandhinagar',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
  'Anand',
  'Navsari',
  'Morbi',
  'Mehsana',
  'Bharuch',
  'Porbandar',
  'Valsad',
  'Vapi',
  'Veraval',
  'Palanpur',
  'Patan',
  'Botad'
];

export async function GET(_request: NextRequest) {
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    console.log('Starting data sync from RERA API...');
    
    let allProjects: any[] = [];
    let successfulCities = 0;
    let failedCities: string[] = [];
    
    // Fetch data for each city
    for (const city of GUJARAT_CITIES) {
      try {
        const apiUrl = `https://gujrera.gujarat.gov.in/dashboard/get-district-wise-projectlist/0/0/all/${city}/all`;
        console.log(`Fetching data for ${city}...`);
        
        const rawData = await fetchWithNode(apiUrl);
        const data = JSON.parse(rawData);
        
        if (data.status === '200' && data.data && Array.isArray(data.data)) {
          console.log(`Got ${data.data.length} projects for ${city}`);
          allProjects = allProjects.concat(data.data);
          successfulCities++;
        } else {
          console.log(`No data for ${city}`);
          failedCities.push(city);
        }
      } catch (cityError) {
        console.error(`Error fetching ${city}:`, cityError);
        failedCities.push(city);
        
        // Try with curl as fallback
        try {
          const { exec } = require('child_process');
          const util = require('util');
          const execPromise = util.promisify(exec);
          
          const apiUrl = `https://gujrera.gujarat.gov.in/dashboard/get-district-wise-projectlist/0/0/all/${city}/all`;
          const { stdout } = await execPromise(`curl -k -s "${apiUrl}"`, { maxBuffer: 1024 * 1024 * 50 });
          const data = JSON.parse(stdout);
          
          if (data.status === '200' && data.data && Array.isArray(data.data)) {
            console.log(`Got ${data.data.length} projects for ${city} (via curl)`);
            allProjects = allProjects.concat(data.data);
            successfulCities++;
            // Remove from failed list since curl succeeded
            failedCities = failedCities.filter(c => c !== city);
          }
        } catch (curlError) {
          console.error(`Curl also failed for ${city}`);
        }
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Total projects fetched: ${allProjects.length} from ${successfulCities} cities`);
    
    if (allProjects.length > 0) {
      // Save to database
      await saveProjects(allProjects);
      await updateCityStats();
      await recordFetch('full_sync', allProjects.length, true);
      
      return NextResponse.json({
        success: true,
        message: 'Data synced successfully',
        projectsCount: allProjects.length,
        citiesSuccess: successfulCities,
        citiesFailed: failedCities,
        syncedAt: new Date().toISOString()
      });
    } else {
      throw new Error('No projects fetched from any city');
    }
    
  } catch (error) {
    console.error('Error syncing data:', error);
    await recordFetch('full_sync_failed', 0, false);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}