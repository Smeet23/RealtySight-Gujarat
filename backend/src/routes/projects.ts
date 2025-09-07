import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';

export const projectRoutes = Router();
const projectController = new ProjectController();

projectRoutes.get('/', projectController.getAllProjects);
projectRoutes.get('/:id', projectController.getProjectById);
projectRoutes.get('/rera/:reraId', projectController.getProjectByReraId);
projectRoutes.get('/city/:city', projectController.getProjectsByCity);
projectRoutes.get('/developer/:developerId', projectController.getProjectsByDeveloper);