import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

interface ProjectFilters {
  page: number;
  limit: number;
  city?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Path to real RERA data file
const reraDataPath = path.join(process.cwd(), 'rera-data.json');

// Load real RERA data
async function loadReraData() {
  try {
    const data = await fs.readFile(reraDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading RERA data:', error);
    return {
      lastUpdated: new Date().toISOString(),
      totalProjects: 0,
      projects: []
    };
  }
}

export class ProjectService {
  async getAllProjects(filters: ProjectFilters) {
    try {
      const { page, limit, city, status } = filters;
      const data = await loadReraData();
      
      let projects = [...data.projects];
      
      // Apply filters
      if (city) {
        projects = projects.filter((p: any) => 
          p.district?.toLowerCase() === city.toLowerCase()
        );
      }
      
      if (status) {
        projects = projects.filter((p: any) => 
          p.status?.toLowerCase() === status.toLowerCase()
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProjects = projects.slice(startIndex, endIndex);
      
      // Transform to match expected format
      const transformedProjects = paginatedProjects.map((p: any) => ({
        id: p.reraId,
        rera_project_id: p.reraId,
        project_name: p.projectName,
        city: p.district,
        booking_percentage: p.bookingPercentage || 0,
        min_price: p.minPrice || 0,
        max_price: p.maxPrice || 0,
        locality: p.locality,
        promoter_name: p.promoterName,
        total_units: p.totalUnits,
        available_units: p.availableUnits
      }));

      return {
        data: transformedProjects,
        pagination: {
          page,
          limit,
          total: projects.length,
          totalPages: Math.ceil(projects.length / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(id: string) {
    try {
      const data = await loadReraData();
      const project = data.projects.find((p: any) => p.reraId === id);
      
      if (!project) {
        return null;
      }
      
      return {
        id: project.reraId,
        rera_project_id: project.reraId,
        project_name: project.projectName,
        city: project.district,
        booking_percentage: project.bookingPercentage || 0,
        locality: project.locality,
        promoter_name: project.promoterName,
        total_units: project.totalUnits,
        available_units: project.availableUnits,
        price: project.price,
        address: project.address,
        status: project.status,
        completion_date: project.completionDate,
        approved_on: project.approvedOn
      };
    } catch (error) {
      logger.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  async getProjectByReraId(reraId: string) {
    try {
      const data = await loadReraData();
      const project = data.projects.find((p: any) => p.reraId === reraId);
      
      if (!project) {
        return null;
      }
      
      return {
        id: project.reraId,
        rera_project_id: project.reraId,
        project_name: project.projectName,
        city: project.district,
        locality: project.locality,
        promoter_name: project.promoterName,
        booking_percentage: project.bookingPercentage || 0,
        total_units: project.totalUnits,
        available_units: project.availableUnits,
        price: project.price,
        address: project.address,
        status: project.status
      };
    } catch (error) {
      logger.error('Error fetching project by RERA ID:', error);
      throw error;
    }
  }

  async getProjectsByCity(city: string, page: number, limit: number) {
    try {
      const data = await loadReraData();
      const cityProjects = data.projects.filter((p: any) => 
        p.district?.toLowerCase() === city.toLowerCase()
      );
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProjects = cityProjects.slice(startIndex, endIndex);
      
      const transformedProjects = paginatedProjects.map((p: any) => ({
        id: p.reraId,
        project_name: p.projectName,
        city: p.district,
        locality: p.locality,
        promoter_name: p.promoterName,
        booking_percentage: p.bookingPercentage || 0
      }));
      
      return {
        data: transformedProjects,
        pagination: {
          page,
          limit,
          total: cityProjects.length,
          totalPages: Math.ceil(cityProjects.length / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching projects by city:', error);
      throw error;
    }
  }

  async getProjectsByDeveloper(developerId: string) {
    try {
      const data = await loadReraData();
      const developerProjects = data.projects.filter((p: any) => 
        p.promoterName?.toLowerCase().includes(developerId.toLowerCase())
      );
      
      return developerProjects.map((p: any) => ({
        id: p.reraId,
        developer_id: p.promoterName,
        project_name: p.projectName,
        city: p.district,
        locality: p.locality,
        booking_percentage: p.bookingPercentage || 0
      }));
    } catch (error) {
      logger.error('Error fetching projects by developer:', error);
      throw error;
    }
  }
}