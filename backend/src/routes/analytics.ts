import { Router } from 'express';

export const analyticsRoutes = Router();

analyticsRoutes.get('/market/:city', (req, res) => {
  const { city } = req.params;
  
  // Real data structure based on RERA website
  const mockData: Record<string, any> = {
    Ahmedabad: {
      totalProjects: 2059,
      avgBookingRate: 78.5,
      avgPricePerSqFt: 4500,
      topDevelopers: ["Adani Realty", "Ganesh Housing", "Goyal & Co"],
      newLaunches: 85,
      completedProjects: 621,
    },
    Surat: {
      totalProjects: 930,
      avgBookingRate: 72.3,
      avgPricePerSqFt: 3800,
      topDevelopers: ["Shivalik Group", "SNS Developers", "Dream House"],
      newLaunches: 45,
      completedProjects: 256,
    },
    Vadodara: {
      totalProjects: 1511,
      avgBookingRate: 68.2,
      avgPricePerSqFt: 3200,
      topDevelopers: ["Alembic Real Estate", "Savvy Group", "Satyam Developers"],
      newLaunches: 62,
      completedProjects: 420,
    },
    Rajkot: {
      totalProjects: 1112,
      avgBookingRate: 65.8,
      avgPricePerSqFt: 2900,
      topDevelopers: ["KP Group", "Silver Oak", "RK Developers"],
      newLaunches: 38,
      completedProjects: 355,
    },
  };

  res.json({
    success: true,
    data: mockData[city] || mockData.Ahmedabad
  });
});

analyticsRoutes.get('/trends', (_req, res) => {
  res.json({
    success: true,
    data: {
      priceGrowth: 8.5,
      demandIndex: 75,
      supplyIndex: 62
    }
  });
});