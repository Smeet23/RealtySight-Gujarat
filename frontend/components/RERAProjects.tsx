"use client";

import { useEffect, useState } from "react";

interface Project {
  projectName: string;
  promoterName: string;
  projectType: string;
  district: string;
  reraId: string;
  approvedOn: string;
  status?: string;
  projectCost?: number;
}

interface RERAData {
  cityStats: Record<string, number>;
  recentProjects: Project[];
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  newProjects: number;
  topDevelopers?: Array<{ name: string; projectCount: number }>;
  totalValue?: number;
}

export default function RERAProjects() {
  const [reraData, setReraData] = useState<RERAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRERAData();
  }, []);

  const fetchRERAData = async () => {
    try {
      const response = await fetch('/api/rera/gujarat');
      const result = await response.json();
      
      if (result.success) {
        setReraData({
          cityStats: result.cityStats || {},
          recentProjects: result.recentProjects || [],
          totalProjects: result.totalProjects || 0,
          ongoingProjects: result.ongoingProjects || 0,
          completedProjects: result.completedProjects || 0,
          newProjects: result.newProjects || 0,
          topDevelopers: result.topDevelopers || [],
          totalValue: result.totalValue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching RERA data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading RERA data...</div>
      </div>
    );
  }

  if (!reraData || reraData.totalProjects === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        No data available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Gujarat RERA Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-3xl font-bold">{reraData.totalProjects?.toLocaleString()}</div>
            <div className="text-purple-200">Total Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{reraData.ongoingProjects?.toLocaleString()}</div>
            <div className="text-purple-200">Ongoing Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{reraData.completedProjects?.toLocaleString()}</div>
            <div className="text-purple-200">Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{Object.keys(reraData.cityStats).length}</div>
            <div className="text-purple-200">Cities Covered</div>
          </div>
        </div>
      </div>

      {/* City-wise Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">City-wise Project Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(reraData.cityStats)
            .filter(([city]) => city !== 'Others')
            .slice(0, 10)
            .map(([city, count]) => (
              <a
                key={city}
                href={`/city/${city.toLowerCase()}`}
                className="bg-gray-50 rounded-lg p-3 text-center hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-2xl font-bold text-indigo-600 group-hover:text-indigo-700">{count.toLocaleString()}</div>
                <div className="text-sm text-gray-600 group-hover:text-gray-900">{city}</div>
                <div className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  View Projects →
                </div>
              </a>
            ))}
        </div>
      </div>

      {/* Recent Projects with Booking Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recent Projects with Booking Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reraData.recentProjects.map((project, index) => (
                <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/project/${encodeURIComponent(project.reraId)}`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 text-blue-600 hover:text-blue-800">{project.projectName}</div>
                    <div className="text-xs text-gray-500">{project.reraId}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {project.promoterName ? (
                      <a 
                        href={`/builder/${project.promoterName.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {project.promoterName}
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.district}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.projectType || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status?.toLowerCase() === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : project.status?.toLowerCase() === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {project.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Developers */}
      {reraData.topDevelopers && reraData.topDevelopers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Top Developers in Gujarat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reraData.topDevelopers.slice(0, 6).map((developer, index) => (
              <a 
                key={index} 
                href={`/builder/${developer.name?.toLowerCase().replace(/\s+/g, '-') || '#'}`}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{developer.name}</div>
                  <div className="text-xs text-gray-500">{developer.projectCount} projects</div>
                </div>
                <div className="text-blue-600 text-sm">→</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}