"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CityAnalytics {
  name: string;
  totalProjects: number;
  avgBookingRate: number;
  totalUnits: number;
  avgPriceRange: string;
  topDevelopers: string[];
  popularLocalities: string[];
  projectTypes: {
    residential: number;
    commercial: number;
    plotted: number;
    mixed: number;
  };
  monthlyTrend: {
    month: string;
    newProjects: number;
    bookingRate: number;
  }[];
}

export default function CityAnalyticsPage() {
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [compareCity, setCompareCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'analytics' | 'comparison'>('analytics');

  const cities = [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
    'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Vapi'
  ];

  const getCityAnalytics = (city: string): CityAnalytics => {
    const cityData: Record<string, CityAnalytics> = {
      'Ahmedabad': {
        name: city,
        totalProjects: 4232,
        avgBookingRate: 82,
        totalUnits: 125000,
        avgPriceRange: '₹45-120L',
        topDevelopers: ['Adani Realty', 'Safal Group', 'Ganesh Housing', 'Savvy Group', 'Sun Builders'],
        popularLocalities: ['Satellite', 'Bodakdev', 'Vastrapur', 'SG Highway', 'Prahlad Nagar'],
        projectTypes: { residential: 2800, commercial: 800, plotted: 400, mixed: 232 },
        monthlyTrend: [
          { month: 'Jan', newProjects: 45, bookingRate: 78 },
          { month: 'Feb', newProjects: 52, bookingRate: 80 },
          { month: 'Mar', newProjects: 58, bookingRate: 82 },
          { month: 'Apr', newProjects: 61, bookingRate: 84 },
          { month: 'May', newProjects: 55, bookingRate: 82 },
          { month: 'Jun', newProjects: 48, bookingRate: 81 }
        ]
      },
      'Surat': {
        name: city,
        totalProjects: 2856,
        avgBookingRate: 78,
        totalUnits: 95000,
        avgPriceRange: '₹35-85L',
        topDevelopers: ['Dream Group', 'Shivalik Group', 'Raghuvir Corporation', 'Shree Developers', 'Apple Group'],
        popularLocalities: ['Adajan', 'Vesu', 'Althan', 'Citylight', 'Dumas'],
        projectTypes: { residential: 2000, commercial: 500, plotted: 250, mixed: 106 },
        monthlyTrend: [
          { month: 'Jan', newProjects: 35, bookingRate: 75 },
          { month: 'Feb', newProjects: 38, bookingRate: 76 },
          { month: 'Mar', newProjects: 42, bookingRate: 77 },
          { month: 'Apr', newProjects: 45, bookingRate: 79 },
          { month: 'May', newProjects: 40, bookingRate: 78 },
          { month: 'Jun', newProjects: 36, bookingRate: 78 }
        ]
      },
      'Vadodara': {
        name: city,
        totalProjects: 1923,
        avgBookingRate: 75,
        totalUnits: 62000,
        avgPriceRange: '₹30-75L',
        topDevelopers: ['Alembic Group', 'Sahajanand Group', 'Aagam Group', 'Shreenath Group', 'Trinity Group'],
        popularLocalities: ['Alkapuri', 'Gotri', 'Vasna', 'Manjalpur', 'Akota'],
        projectTypes: { residential: 1400, commercial: 350, plotted: 120, mixed: 53 },
        monthlyTrend: [
          { month: 'Jan', newProjects: 22, bookingRate: 72 },
          { month: 'Feb', newProjects: 25, bookingRate: 73 },
          { month: 'Mar', newProjects: 28, bookingRate: 74 },
          { month: 'Apr', newProjects: 30, bookingRate: 76 },
          { month: 'May', newProjects: 27, bookingRate: 75 },
          { month: 'Jun', newProjects: 24, bookingRate: 75 }
        ]
      },
      'Rajkot': {
        name: city,
        totalProjects: 1654,
        avgBookingRate: 72,
        totalUnits: 48000,
        avgPriceRange: '₹25-65L',
        topDevelopers: ['KKP Group', 'Radhe Developers', 'Shivam Group', 'Krishna Group', 'Om Developers'],
        popularLocalities: ['Kalavad Road', 'University Road', 'Nana Mauva', 'Madhapar', 'Raiya Road'],
        projectTypes: { residential: 1200, commercial: 280, plotted: 130, mixed: 44 },
        monthlyTrend: [
          { month: 'Jan', newProjects: 18, bookingRate: 70 },
          { month: 'Feb', newProjects: 20, bookingRate: 71 },
          { month: 'Mar', newProjects: 22, bookingRate: 72 },
          { month: 'Apr', newProjects: 24, bookingRate: 73 },
          { month: 'May', newProjects: 21, bookingRate: 72 },
          { month: 'Jun', newProjects: 19, bookingRate: 72 }
        ]
      },
      'Gandhinagar': {
        name: city,
        totalProjects: 823,
        avgBookingRate: 85,
        totalUnits: 32000,
        avgPriceRange: '₹50-150L',
        topDevelopers: ['GIFT City', 'Adani Shantigram', 'Vaishnodevi Group', 'Swaminarayan Group', 'Satyam Group'],
        popularLocalities: ['Infocity', 'Kudasan', 'Sargasan', 'Raysan', 'GIFT City'],
        projectTypes: { residential: 500, commercial: 200, plotted: 80, mixed: 43 },
        monthlyTrend: [
          { month: 'Jan', newProjects: 12, bookingRate: 82 },
          { month: 'Feb', newProjects: 14, bookingRate: 83 },
          { month: 'Mar', newProjects: 16, bookingRate: 84 },
          { month: 'Apr', newProjects: 18, bookingRate: 86 },
          { month: 'May', newProjects: 15, bookingRate: 85 },
          { month: 'Jun', newProjects: 13, bookingRate: 85 }
        ]
      }
    };

    return cityData[city] || {
      name: city,
      totalProjects: Math.floor(Math.random() * 500) + 200,
      avgBookingRate: Math.floor(Math.random() * 30) + 60,
      totalUnits: Math.floor(Math.random() * 20000) + 5000,
      avgPriceRange: '₹20-50L',
      topDevelopers: ['Local Developer 1', 'Local Developer 2', 'Local Developer 3'],
      popularLocalities: ['Area 1', 'Area 2', 'Area 3'],
      projectTypes: { 
        residential: Math.floor(Math.random() * 300) + 100,
        commercial: Math.floor(Math.random() * 100) + 20,
        plotted: Math.floor(Math.random() * 50) + 10,
        mixed: Math.floor(Math.random() * 30) + 5
      },
      monthlyTrend: [
        { month: 'Jan', newProjects: 10, bookingRate: 65 },
        { month: 'Feb', newProjects: 12, bookingRate: 66 },
        { month: 'Mar', newProjects: 14, bookingRate: 67 },
        { month: 'Apr', newProjects: 15, bookingRate: 68 },
        { month: 'May', newProjects: 13, bookingRate: 67 },
        { month: 'Jun', newProjects: 11, bookingRate: 67 }
      ]
    };
  };

  const cityData = getCityAnalytics(selectedCity);
  const compareData = compareCity ? getCityAnalytics(compareCity) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">City Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive real estate analytics by city</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* City Selection and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare With</label>
                <select
                  value={compareCity || ''}
                  onChange={(e) => {
                    setCompareCity(e.target.value || null);
                    if (e.target.value) setViewMode('comparison');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Comparison</option>
                  {cities.filter(c => c !== selectedCity).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Analytics View
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                disabled={!compareCity}
                className={`px-4 py-2 rounded-lg ${viewMode === 'comparison' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} ${!compareCity ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Comparison View
              </button>
              <Link
                href={`/city/${selectedCity.toLowerCase()}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                View Projects →
              </Link>
            </div>
          </div>
        </div>

        {viewMode === 'analytics' ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Total Projects</span>
                  <span className="text-green-600 text-xs">+12%</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{cityData.totalProjects.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Active RERA registered</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Avg Booking Rate</span>
                  <span className="text-green-600 text-xs">+5%</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{cityData.avgBookingRate}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${cityData.avgBookingRate}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Total Units</span>
                  <span className="text-blue-600 text-xs">Active</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{cityData.totalUnits.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Across all projects</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Price Range</span>
                  <span className="text-yellow-600 text-xs">Market Avg</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{cityData.avgPriceRange}</div>
                <div className="text-xs text-gray-500 mt-1">Residential units</div>
              </div>
            </div>

            {/* Project Type Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Project Type Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Residential</span>
                      <span className="text-sm font-medium">{cityData.projectTypes.residential}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(cityData.projectTypes.residential / cityData.totalProjects) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Commercial</span>
                      <span className="text-sm font-medium">{cityData.projectTypes.commercial}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(cityData.projectTypes.commercial / cityData.totalProjects) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Plotted Development</span>
                      <span className="text-sm font-medium">{cityData.projectTypes.plotted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(cityData.projectTypes.plotted / cityData.totalProjects) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Mixed Development</span>
                      <span className="text-sm font-medium">{cityData.projectTypes.mixed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(cityData.projectTypes.mixed / cityData.totalProjects) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">6-Month Trend</h3>
                <div className="space-y-2">
                  {cityData.monthlyTrend.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-12">{month.month}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(month.newProjects / 70) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 w-12">{month.newProjects}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{month.bookingRate}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500">■ New Projects</span>
                  <span className="text-xs text-gray-500">Booking Rate %</span>
                </div>
              </div>
            </div>

            {/* Top Developers and Popular Localities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Top Developers</h3>
                <div className="space-y-2">
                  {cityData.topDevelopers.map((developer, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900">{developer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Popular Localities</h3>
                <div className="flex flex-wrap gap-2">
                  {cityData.popularLocalities.map((locality, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {locality}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/city/${selectedCity.toLowerCase()}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View all localities in {selectedCity} →
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Comparison View */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">City Comparison: {selectedCity} vs {compareCity}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedCity}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{compareCity}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Projects</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cityData.totalProjects.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{compareData?.totalProjects.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={cityData.totalProjects > (compareData?.totalProjects || 0) ? 'text-green-600' : 'text-red-600'}>
                        {((cityData.totalProjects - (compareData?.totalProjects || 0)) > 0 ? '+' : '') + (cityData.totalProjects - (compareData?.totalProjects || 0))}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Avg Booking Rate</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cityData.avgBookingRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{compareData?.avgBookingRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={cityData.avgBookingRate > (compareData?.avgBookingRate || 0) ? 'text-green-600' : 'text-red-600'}>
                        {((cityData.avgBookingRate - (compareData?.avgBookingRate || 0)) > 0 ? '+' : '') + (cityData.avgBookingRate - (compareData?.avgBookingRate || 0))}%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cityData.totalUnits.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{compareData?.totalUnits.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={cityData.totalUnits > (compareData?.totalUnits || 0) ? 'text-green-600' : 'text-red-600'}>
                        {((cityData.totalUnits - (compareData?.totalUnits || 0)) > 0 ? '+' : '') + (cityData.totalUnits - (compareData?.totalUnits || 0)).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price Range</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cityData.avgPriceRange}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{compareData?.avgPriceRange}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}