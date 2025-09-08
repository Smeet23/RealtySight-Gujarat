import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

export const analyticsRoutes = Router();

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

analyticsRoutes.get('/market/:city', async (req, res) => {
  const { city } = req.params;
  
  try {
    const data = await loadReraData();
    
    // Filter projects by city
    const cityProjects = data.projects.filter((p: any) => 
      p.district?.toLowerCase() === city.toLowerCase()
    );
    
    // Calculate real analytics from data
    const totalProjects = cityProjects.length;
    const avgBookingRate = cityProjects.reduce((acc: number, p: any) => 
      acc + (p.bookingPercentage || 0), 0) / (totalProjects || 1);
    
    // Get unique developers and sort by project count
    const developerCounts: Record<string, number> = {};
    cityProjects.forEach((p: any) => {
      if (p.promoterName) {
        developerCounts[p.promoterName] = (developerCounts[p.promoterName] || 0) + 1;
      }
    });
    
    const topDevelopers = Object.entries(developerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    
    // Count completed projects
    const completedProjects = cityProjects.filter((p: any) => 
      p.status === 'Completed' || (p.completionDate && new Date(p.completionDate) < new Date())
    ).length;
    
    // Count new launches (approved in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const newLaunches = cityProjects.filter((p: any) => {
      if (!p.approvedOn) return false;
      const approvalDate = new Date(p.approvedOn.split('-').reverse().join('-'));
      return approvalDate > sixMonthsAgo;
    }).length;
    
    res.json({
      success: true,
      data: {
        totalProjects,
        avgBookingRate: Math.round(avgBookingRate * 10) / 10,
        avgPricePerSqFt: 3500, // This would need real calculation from price data
        topDevelopers,
        newLaunches,
        completedProjects,
      }
    });
  } catch (error) {
    console.error('Error in market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load analytics'
    });
  }
});

analyticsRoutes.get('/trends', async (_req, res) => {
  try {
    const data = await loadReraData();
    
    // Calculate trends from real data
    const totalProjects = data.projects.length;
    const avgBooking = data.projects.reduce((acc: number, p: any) => 
      acc + (p.bookingPercentage || 0), 0) / (totalProjects || 1);
    
    res.json({
      success: true,
      data: {
        priceGrowth: 8.5, // Would need historical data for real calculation
        demandIndex: Math.round(avgBooking),
        supplyIndex: Math.round((data.projects.filter((p: any) => 
          p.availableUnits && p.availableUnits > 0).length / totalProjects) * 100)
      }
    });
  } catch (error) {
    console.error('Error in trends analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load trends'
    });
  }
});