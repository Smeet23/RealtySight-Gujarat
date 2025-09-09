"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  marketStats: any;
  cityDistribution: any[];
  topDevelopers: any[];
  timelineAnalysis: any[];
  delayAnalysis: any;
  typeDistribution: any[];
  monthlyTrend: any[];
  investmentCategories: any[];
  developerConcentration: any[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCity]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url = selectedCity 
        ? `/api/analytics?city=${encodeURIComponent(selectedCity)}`
        : '/api/analytics';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value?.toLocaleString() || 0}`;
  };

  const formatNumber = (value: number) => {
    return value?.toLocaleString('en-IN') || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="text-white/80 hover:text-white mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Gujarat RERA Analytics</h1>
          <p className="text-white/80">Real-time insights from {formatNumber(analytics.marketStats.total_projects)} projects</p>
          
          {/* City Filter */}
          <div className="mt-4">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 rounded-lg text-gray-800 bg-white shadow-lg"
            >
              <option value="">All Cities</option>
              {analytics.cityDistribution.map((city: any) => (
                <option key={city.city} value={city.city}>
                  {city.city} ({city.project_count} projects)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Investment</div>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(analytics.marketStats.total_investment)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {formatCurrency(analytics.marketStats.avg_project_cost)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Projects</div>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analytics.marketStats.total_projects)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.marketStats.ongoing_projects} ongoing, {analytics.marketStats.new_projects} new
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Developers</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(analytics.marketStats.total_developers)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Across {analytics.marketStats.total_cities} cities
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Units</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(analytics.marketStats.total_units_in_market)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatNumber(analytics.marketStats.total_area_developed)} sq.m area
            </div>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Project Status Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {analytics.marketStats.ongoing_projects}
              </div>
              <div className="text-sm text-gray-600">Ongoing</div>
              <div className="text-xs text-gray-500">
                {((analytics.marketStats.ongoing_projects / analytics.marketStats.total_projects) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.marketStats.new_projects}
              </div>
              <div className="text-sm text-gray-600">New</div>
              <div className="text-xs text-gray-500">
                {((analytics.marketStats.new_projects / analytics.marketStats.total_projects) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {analytics.marketStats.completed_projects}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-xs text-gray-500">
                {((analytics.marketStats.completed_projects / analytics.marketStats.total_projects) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Project Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Project Types by Investment</h3>
          <div className="space-y-4">
            {analytics.typeDistribution.map((type: any) => (
              <div key={type.project_type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{type.project_type}</span>
                    <span className="text-sm text-gray-600">
                      {type.count} projects | {formatCurrency(type.total_investment)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ 
                        width: `${(type.total_investment / analytics.typeDistribution[0].total_investment) * 100}%`,
                        minWidth: '80px'
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {formatNumber(type.total_units)} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Developers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Top Developers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Developer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Investment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cities</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Types</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topDevelopers.slice(0, 10).map((developer: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{developer.developer_name}</td>
                    <td className="px-4 py-3 text-sm">{developer.project_count}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(developer.total_investment)}</td>
                    <td className="px-4 py-3 text-sm">{developer.cities_present}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{developer.project_types}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Projects by Investment Size</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.investmentCategories.map((category: any) => (
              <div key={category.investment_category} className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{category.project_count}</div>
                <div className="text-xs text-gray-600 font-medium">{category.investment_category}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ~{Math.round(category.avg_units || 0)} units avg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City Distribution */}
        {!selectedCity && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">City-wise Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.cityDistribution.slice(0, 6).map((city: any) => (
                <div key={city.city} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{city.city}</h4>
                    <Link 
                      href={`/city/${city.city.toLowerCase()}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-semibold ml-1">{city.project_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-semibold ml-1">{formatCurrency(city.total_investment)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ongoing:</span>
                      <span className="font-semibold ml-1">{city.ongoing_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">New:</span>
                      <span className="font-semibold ml-1">{city.new_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Project Approvals Trend */}
        {analytics.monthlyTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Monthly Approval Trend (Last 12 Months)</h3>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((month: any, index: number) => {
                const date = new Date(month.month);
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{monthName}</span>
                        <span className="text-sm text-gray-600">
                          {month.projects_approved} projects | {formatCurrency(month.investment_approved || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                          style={{ 
                            width: `${Math.min((month.projects_approved / Math.max(...analytics.monthlyTrend.map((m: any) => m.projects_approved))) * 100, 100)}%`,
                            minWidth: '20px'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline Analysis */}
        {analytics.timelineAnalysis.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Project Launch Timeline (Since 2020)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.timelineAnalysis.slice(0, 8).map((period: any, index: number) => (
                <div key={index} className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-indigo-600">{period.projects_started}</div>
                  <div className="text-xs text-gray-600">
                    {period.month}/{period.year}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCurrency(period.investment_started || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}