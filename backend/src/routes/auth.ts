import { Router } from 'express';

export const authRoutes = Router();

authRoutes.post('/login', (_req, res) => {
  // TODO: Implement login
  res.json({ message: 'Login endpoint' });
});

authRoutes.post('/register', (_req, res) => {
  // TODO: Implement registration
  res.json({ message: 'Register endpoint' });
});

authRoutes.post('/logout', (_req, res) => {
  // TODO: Implement logout
  res.json({ message: 'Logout endpoint' });
});