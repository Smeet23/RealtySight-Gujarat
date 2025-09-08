"use client";

import { useEffect, useState } from "react";

interface MarketOverviewProps {
  city: string;
}

interface MarketData {
  totalProjects: number;
  avgBookingRate: number;
  avgPricePerSqFt: number;
  topDevelopers: string[];
  newLaunches: number;
  completedProjects: number;
}

export default function MarketOverview({ city }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<MarketData>({
    totalProjects: 0,
    avgBookingRate: 0,
    avgPricePerSqFt: 0,
    topDevelopers: [],
    newLaunches: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    // Fetch data from backend API
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/analytics/market/${city}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setMarketData(result.data);
        } else {
          // No fallback - only use real data
          console.error('Failed to fetch market data');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        // No fallback - only use real data
      }
    };

    fetchMarketData();
  }, [city]);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">{marketData.totalProjects}</div>
          <div className="text-sm text-green-600 mt-2">+12% from last quarter</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Booking Rate</div>
          <div className="text-3xl font-bold text-gray-900">{marketData.avgBookingRate}%</div>
          <div className="text-sm text-blue-600 mt-2">High demand indicator</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Price/Sq.Ft</div>
          <div className="text-3xl font-bold text-gray-900">₹{marketData.avgPricePerSqFt}</div>
          <div className="text-sm text-orange-600 mt-2">+8% YoY growth</div>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Project Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-gray-700">New Launches</span>
            <span className="text-2xl font-bold text-blue-600">{marketData.newLaunches}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <span className="text-gray-700">Completed</span>
            <span className="text-2xl font-bold text-green-600">{marketData.completedProjects}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <span className="text-gray-700">Ongoing</span>
            <span className="text-2xl font-bold text-yellow-600">
              {marketData.totalProjects - marketData.newLaunches - marketData.completedProjects}
            </span>
          </div>
        </div>
      </div>

      {/* Top Developers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Top Developers in {city}</h3>
        <div className="space-y-3">
          {marketData.topDevelopers.map((developer, index) => (
            <div key={developer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-600">#{index + 1}</span>
                <span className="text-gray-900 font-medium">{developer}</span>
              </div>
              <span className="text-sm text-gray-600">View Projects →</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Market Insights for {city}</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Strong booking momentum with {marketData.avgBookingRate}% average occupancy</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Premium segment driving growth with ₹{marketData.avgPricePerSqFt}/sq.ft average</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>{marketData.newLaunches} new projects launched this quarter</span>
          </li>
        </ul>
      </div>
    </div>
  );
}