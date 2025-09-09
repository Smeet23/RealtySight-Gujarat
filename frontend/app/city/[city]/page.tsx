"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UnderConstruction from '@/components/UnderConstruction';

interface Project {
  id: number;
  name: string;
  developer: string;
  type: string;
  status: string;
  location: string;
  city: string;
  registrationNo: string;
  approvedDate: string;
  startDate: string;
  completionDate: string;
  projectCost: number;
  contact: {
    email: string;
    phone: string;
  };
}

interface CityStats {
  total: number;
  ongoing: number;
  completed: number;
  new: number;
  residential: number;
  commercial: number;
  mixed: number;
  totalValue: number;
}

export default function CityProjectsPage() {
  const params = useParams();
  const cityName = params.city as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [cityStats, setCityStats] = useState<CityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  
  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('nameAZ');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  useEffect(() => {
    fetchCityData(1);
  }, [cityName]);

  useEffect(() => {
    // Apply filters to already fetched data
    if (projects.length > 0) {
      applyFilters(projects);
    }
  }, [selectedType, searchQuery, sortBy, projects]);

  const handlePageChange = (page: number) => {
    fetchCityData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCityData = async (page: number = 1) => {
    try {
      setLoading(true);
      
      // Fetch projects from our RERA API endpoint
      const response = await fetch(`/api/rera/${cityName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.projects) {
        console.log(`Fetched ${result.projects.length} projects for ${cityName}`);
        
        const apiProjects = result.projects;

        // Set pagination info (client-side pagination for now)
        const itemsPerPage = 50;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        setCurrentPage(page);
        setTotalPages(Math.ceil(apiProjects.length / itemsPerPage));
        setTotalProjects(result.totalCount || apiProjects.length);
        
        // Use stats from API
        if (result.stats) {
          setCityStats(result.stats);
        }

        setProjects(apiProjects);
        // Apply filters immediately
        const paginatedProjects = apiProjects.slice(startIndex, endIndex);
        applyFilters(paginatedProjects);
      } else {
        console.error('No projects in response:', result);
        setProjects([]);
        setFilteredProjects([]);
      }
    } catch (error) {
      console.error('Error fetching RERA data:', error);
      // Show error message
      setProjects([]);
      setFilteredProjects([]);
      setTotalProjects(0);
      setTotalPages(0);
      setCityStats(null);
    } finally {
      setLoading(false);
    }
  };



  const applyFilters = (projectsToFilter: Project[]) => {
    let filtered = [...projectsToFilter];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type?.includes(selectedType));
    }


    // Sort
    if (sortBy === 'nameAZ') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'nameZA') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProjects(filtered);
  };



  // Filtering is now done server-side via API

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading {cityName} projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">{cityName} Real Estate Projects</h1>
          <p className="text-blue-100">Comprehensive analysis of all RERA registered projects</p>
        </div>
      </div>

      {/* Stats Bar */}
      {cityStats && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{cityStats.total}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{cityStats.ongoing}</div>
                <div className="text-sm text-gray-600">Ongoing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cityStats.residential}</div>
                <div className="text-sm text-gray-600">Residential</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{cityStats.commercial}</div>
                <div className="text-sm text-gray-600">Commercial</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₹{(cityStats.totalValue / 10000000).toFixed(0)}Cr</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{filteredProjects.length}</div>
                <div className="text-sm text-gray-600">Filtered</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Project, Developer, Locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Project Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Township">Township</option>
                </select>
              </div>


              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* View Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredProjects.length}</span> of {projects.length} projects
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Map
                </button>
              </div>
            </div>

            {/* Projects Display */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.developer}</p>
                        <p className="text-sm text-blue-600">{project.location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                          project.status === 'New' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-medium">{project.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Project Value</p>
                        <p className="text-sm font-medium text-blue-600">₹{(project.projectCost / 10000000).toFixed(1)}Cr</p>
                      </div>
                    </div>


                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Completion: {new Date(project.completionDate).toLocaleDateString()}</span>
                      <Link
                        href={`/project/${encodeURIComponent(project.registrationNo)}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.developer}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{project.location}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{project.type}</td>
                        <td className="px-4 py-4 text-sm text-blue-600 font-medium">₹{(project.projectCost / 10000000).toFixed(1)}Cr</td>
                        <td className="px-4 py-4 text-sm">
                          <Link
                            href={`/project/${encodeURIComponent(project.registrationNo)}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'map' && (
              <UnderConstruction 
                feature="Interactive Map View"
                message="Map visualization for projects is being developed. Soon you'll be able to see all projects on an interactive map with filters and location-based search."
                icon="🗺️"
              />
            )}

            {filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No projects found matching your filters</p>
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, currentPage - 2) + i;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded ${pageNumber === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Next
                </button>

                <div className="ml-4 text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalProjects.toLocaleString()} total projects)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}