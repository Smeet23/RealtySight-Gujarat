import knex, { Knex } from 'knex';
import { logger } from '../utils/logger';

let db: Knex;

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gujarat_real_estate',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: '../../database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: '../../database/seeds',
    extension: 'ts',
  },
};

export async function initializeDatabase(): Promise<void> {
  try {
    db = knex(knexConfig);
    await db.raw('SELECT 1');
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getDb(): Knex {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (db) {
    await db.destroy();
    logger.info('Database connection closed');
  }
}