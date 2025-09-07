"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchFilter from '@/components/SearchFilter';

interface Project {
  projectName: string;
  promoterName: string;
  projectType: string;
  district: string;
  reraId: string;
  approvedOn: string;
  bookingPercentage: number;
  price?: string;
  totalUnits?: number;
  availableUnits?: number;
}

export default function SearchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('bookingPercentage');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const cities = [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
    'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Vapi'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`http://localhost:5001/api/scraper/projects?page=${page}&limit=24${searchParam}`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data.projects);
        setFilteredProjects(result.data.projects);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: any) => {
    let filtered = [...projects];

    // Apply filters
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(p => 
        p.projectName.toLowerCase().includes(searchLower) ||
        p.promoterName.toLowerCase().includes(searchLower) ||
        p.reraId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.city) {
      filtered = filtered.filter(p => p.district === filters.city);
    }

    if (filters.projectType) {
      filtered = filtered.filter(p => p.projectType.includes(filters.projectType));
    }

    if (filters.bookingStatus) {
      const [min, max] = filters.bookingStatus.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(p => p.bookingPercentage >= min && p.bookingPercentage <= max);
      } else {
        filtered = filtered.filter(p => p.bookingPercentage === 100);
      }
    }

    if (filters.developer) {
      filtered = filtered.filter(p => 
        p.promoterName.toLowerCase().includes(filters.developer.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'bookingPercentage':
          return b.bookingPercentage - a.bookingPercentage;
        case 'projectName':
          return a.projectName.localeCompare(b.projectName);
        case 'date':
          return new Date(b.approvedOn).getTime() - new Date(a.approvedOn).getTime();
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy);
    handleSearch({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold mt-2">Search RERA Projects</h1>
              <p className="text-gray-600">
                {filteredProjects.length} of {projects.length} projects
              </p>
              <div className="flex gap-2 mt-3 items-center">
                <span className="text-sm text-gray-500">Quick city access:</span>
                {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'].map(city => (
                  <Link
                    key={city}
                    href={`/city/${city.toLowerCase()}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="bookingPercentage">Sort by Booking %</option>
                <option value="projectName">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filters */}
        <SearchFilter 
          onSearch={handleSearch}
          cities={cities}
        />

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Link
                key={index}
                href={`/project/${encodeURIComponent(project.reraId)}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-600">{project.promoterName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {project.bookingPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">Booked</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{project.projectType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{project.district}</span>
                  </div>
                  {project.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-blue-600">{project.price}</span>
                    </div>
                  )}
                  {project.availableUnits !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{project.availableUnits} units</span>
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full ${
                      project.bookingPercentage >= 80
                        ? 'bg-green-600'
                        : project.bookingPercentage >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${project.bookingPercentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    RERA: {project.reraId.split('/').slice(-2, -1)[0]}
                  </span>
                  <span className="text-xs text-blue-600">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {project.projectName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {project.reraId.split('/').slice(-2, -1)[0]}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.promoterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.projectType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.bookingPercentage >= 80
                                ? 'bg-green-600'
                                : project.bookingPercentage >= 50
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${project.bookingPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {project.bookingPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.price || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/project/${encodeURIComponent(project.reraId)}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found matching your criteria</p>
            <button
              onClick={() => handleSearch({})}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}