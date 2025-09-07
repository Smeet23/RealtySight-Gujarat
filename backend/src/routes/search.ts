import { Router } from 'express';

export const searchRoutes = Router();

searchRoutes.get('/', (req, res) => {
  const { q, type, city } = req.query;
  
  res.json({
    success: true,
    query: { q, type, city },
    results: [],
    message: 'Search endpoint - to be implemented'
  });
});