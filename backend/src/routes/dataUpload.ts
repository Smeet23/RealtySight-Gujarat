import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { logger } from '../utils/logger';

export const dataUploadRoutes = Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/json' || 
        file.originalname.endsWith('.csv') || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  }
});

const dataFile = path.join(process.cwd(), 'rera-data.json');

// Upload real RERA data (CSV or JSON)
dataUploadRoutes.post('/upload', upload.single('reraFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let projects: any[] = [];

    if (fileExtension === '.json') {
      // Handle JSON file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      projects = Array.isArray(data) ? data : data.projects || [];
      
    } else if (fileExtension === '.csv') {
      // Handle CSV file
      projects = await new Promise((resolve, reject) => {
        const results: any[] = [];
        
        require('fs').createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    }

    // Validate and clean data
    const validProjects = projects.map(p => ({
      projectName: p.projectName || p.project_name || p.name || '',
      promoterName: p.promoterName || p.promoter_name || p.developer || '',
      projectType: p.projectType || p.project_type || 'Residential',
      district: p.district || p.city || '',
      locality: p.locality || p.area || '',
      pincode: p.pincode || p.pin_code || '',
      address: p.address || p.project_address || '',
      approvedOn: p.approvedOn || p.approval_date || '',
      completionDate: p.completionDate || p.completion_date || '',
      totalUnits: parseInt(p.totalUnits || p.total_units || '0') || 0,
      availableUnits: parseInt(p.availableUnits || p.available_units || '0') || 0,
      projectArea: parseFloat(p.projectArea || p.project_area || '0') || 0,
      totalBuildings: parseInt(p.totalBuildings || p.total_buildings || '0') || 0,
      status: p.status || 'Registered',
      bookingPercentage: parseInt(p.bookingPercentage || '0') || 0,
      reraId: p.reraId || p.rera_id || p.registration_number || ''
    })).filter(p => p.reraId || p.projectName); // Only include projects with RERA ID or name

    if (validProjects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid project data found in uploaded file'
      });
    }

    // Save to database
    const reraData = {
      lastUpdated: new Date().toISOString(),
      totalProjects: validProjects.length,
      projects: validProjects,
      source: 'Manual Upload',
      uploadedBy: req.ip,
      uploadedAt: new Date().toISOString()
    };

    await fs.writeFile(dataFile, JSON.stringify(reraData, null, 2));

    // Clean up uploaded file
    await fs.unlink(filePath);

    logger.info(`✅ Uploaded ${validProjects.length} real RERA projects`);

    // Generate city stats
    const cityStats: Record<string, number> = {};
    validProjects.forEach(p => {
      if (p.district) {
        cityStats[p.district] = (cityStats[p.district] || 0) + 1;
      }
    });

    res.json({
      success: true,
      message: `Successfully uploaded ${validProjects.length} real RERA projects`,
      totalProjects: validProjects.length,
      cityStats,
      lastUpdated: reraData.lastUpdated
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded file'
    });
  }
});

// Manual project entry endpoint
dataUploadRoutes.post('/add-project', async (req, res) => {
  try {
    const projectData = req.body;

    // Validate required fields
    if (!projectData.reraId || !projectData.projectName) {
      return res.status(400).json({
        success: false,
        error: 'RERA ID and Project Name are required'
      });
    }

    // Load existing data
    let existingData;
    try {
      const fileContent = await fs.readFile(dataFile, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      existingData = { projects: [] };
    }

    // Check for duplicates
    const existingProject = existingData.projects.find((p: any) => p.reraId === projectData.reraId);
    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: 'Project with this RERA ID already exists'
      });
    }

    // Add new project
    const newProject = {
      projectName: projectData.projectName,
      promoterName: projectData.promoterName || '',
      projectType: projectData.projectType || 'Residential',
      district: projectData.district || '',
      locality: projectData.locality || '',
      pincode: projectData.pincode || '',
      address: projectData.address || '',
      approvedOn: projectData.approvedOn || '',
      completionDate: projectData.completionDate || '',
      totalUnits: parseInt(projectData.totalUnits) || 0,
      availableUnits: parseInt(projectData.availableUnits) || 0,
      projectArea: parseFloat(projectData.projectArea) || 0,
      totalBuildings: parseInt(projectData.totalBuildings) || 0,
      status: projectData.status || 'Registered',
      bookingPercentage: parseInt(projectData.bookingPercentage) || 0,
      reraId: projectData.reraId
    };

    existingData.projects.push(newProject);
    existingData.totalProjects = existingData.projects.length;
    existingData.lastUpdated = new Date().toISOString();

    await fs.writeFile(dataFile, JSON.stringify(existingData, null, 2));

    logger.info(`✅ Added new real RERA project: ${newProject.projectName}`);

    res.json({
      success: true,
      message: 'Project added successfully',
      project: newProject
    });

  } catch (error) {
    logger.error('Add project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add project'
    });
  }
});

// Get data source info
dataUploadRoutes.get('/source-info', async (req, res) => {
  try {
    const fileContent = await fs.readFile(dataFile, 'utf-8');
    const data = JSON.parse(fileContent);

    res.json({
      success: true,
      source: data.source || 'Generated',
      lastUpdated: data.lastUpdated,
      totalProjects: data.totalProjects,
      uploadedBy: data.uploadedBy,
      uploadedAt: data.uploadedAt
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get source info'
    });
  }
});

// Clear all data (admin function)
dataUploadRoutes.delete('/clear-all', async (req, res) => {
  try {
    const emptyData = {
      lastUpdated: new Date().toISOString(),
      totalProjects: 0,
      projects: []
    };

    await fs.writeFile(dataFile, JSON.stringify(emptyData, null, 2));

    res.json({
      success: true,
      message: 'All data cleared successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
});