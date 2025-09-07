import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { logger } from './utils/logger';
// import { initializeDatabase } from './config/database';
// import { initializeRedis } from './config/redis';
import { startScheduledJobs } from './jobs/scheduler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Skip database and Redis initialization for now
    // await initializeDatabase();
    // logger.info('Database connected successfully');

    // await initializeRedis();
    // logger.info('Redis connected successfully');
    
    logger.info('Starting server without database (mock mode)');

    app.use(helmet());
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
      credentials: true
    }));
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

    app.get('/health', (_req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    app.use('/api', apiRouter);

    app.use(errorHandler);

    if (process.env.NODE_ENV !== 'test') {
      startScheduledJobs();
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;