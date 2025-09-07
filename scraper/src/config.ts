import dotenv from 'dotenv';

dotenv.config();

export const config = {
  rera: {
    baseUrl: process.env.RERA_BASE_URL || 'https://gujrera.gujarat.gov.in',
    searchUrl: 'https://gujrera.gujarat.gov.in', // Use base URL since specific paths are 404
    projectDetailsUrl: 'https://gujrera.gujarat.gov.in',
    developerUrl: 'https://gujrera.gujarat.gov.in',
  },
  scraping: {
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '2000'),
    maxConcurrency: 3,
    timeout: 30000,
    retryAttempts: 3,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gujarat_real_estate',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  cities: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Gandhinagar',
    'Bhavnagar',
    'Jamnagar',
    'Junagadh',
    'Anand',
    'Vapi'
  ]
};