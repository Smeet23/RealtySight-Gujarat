import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';
import { AppError } from '../middleware/errorHandler';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, city, status, minPrice, maxPrice } = req.query;
      
      const projects = await this.projectService.getAllProjects({
        page: Number(page),
        limit: Number(limit),
        city: city as string,
        status: status as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectByReraId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reraId } = req.params;
      const project = await this.projectService.getProjectByReraId(reraId);

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectsByCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const projects = await this.projectService.getProjectsByCity(
        city,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectsByDeveloper = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { developerId } = req.params;
      const projects = await this.projectService.getProjectsByDeveloper(developerId);

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };
}