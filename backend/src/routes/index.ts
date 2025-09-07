import { Router } from 'express';
import { projectRoutes } from './projects';
import { developerRoutes } from './developers';
import { analyticsRoutes } from './analytics';
import { authRoutes } from './auth';
import { searchRoutes } from './search';
import { scraperRoutes } from './scraper';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/developers', developerRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/scraper', scraperRoutes);

apiRouter.get('/', (_req, res) => {
  res.json({
    message: 'Gujarat Real Estate Analytics API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      developers: '/api/developers',
      analytics: '/api/analytics',
      search: '/api/search'
    }
  });
});