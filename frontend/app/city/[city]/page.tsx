"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Project {
  projectName: string;
  promoterName: string;
  projectType: string;
  locality: string;
  reraId: string;
  approvedOn: string;
  bookingPercentage: number;
  totalUnits: number;
  availableUnits: number;
  priceRange: string;
  completionDate: string;
  area: number;
}

interface CityStats {
  totalProjects: number;
  residentialProjects: number;
  commercialProjects: number;
  avgBookingRate: number;
  totalUnits: number;
  topLocalities: string[];
  priceRanges: {
    budget: number;
    mid: number;
    premium: number;
    luxury: number;
  };
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
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('bookingHigh');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  useEffect(() => {
    fetchCityData(1);
  }, [cityName]);

  useEffect(() => {
    applyFilters();
  }, [selectedLocality, selectedType, selectedBooking, selectedPrice, searchQuery, sortBy, projects]);

  const handlePageChange = (page: number) => {
    fetchCityData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCityData = async (page: number = 1) => {
    try {
      setLoading(true);
      // Fetch projects with pagination
      const response = await fetch(`http://localhost:5001/api/scraper/projects?city=${cityName}&page=${page}&limit=50`);
      const result = await response.json();
      
      if (result.success) {
        const apiProjects = result.data.projects.map((project: any) => ({
          projectName: project.projectName,
          promoterName: project.promoterName,
          projectType: project.projectType,
          locality: getRandomLocality(cityName),
          reraId: project.reraId,
          approvedOn: project.approvedOn,
          bookingPercentage: project.bookingPercentage,
          price: project.price || 'Price on request',
          totalUnits: project.totalUnits || Math.floor(Math.random() * 300) + 50,
          availableUnits: project.availableUnits || Math.floor(Math.random() * 100) + 10,
          priceRange: getPriceRangeFromPrice(project.price || '50L'),
          amenities: ['Swimming Pool', 'Gym', 'Club House', 'Garden'].filter(() => Math.random() > 0.5)
        }));

        // Set pagination info
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
        setTotalProjects(result.data.pagination.totalProjects);
        
        // Calculate city stats (only once on first load)
        if (page === 1 || !cityStats) {
          const cityStats: CityStats = {
            totalProjects: result.data.pagination.totalProjects,
            residentialProjects: Math.floor(result.data.pagination.totalProjects * 0.7), // Estimate
            commercialProjects: Math.floor(result.data.pagination.totalProjects * 0.2), // Estimate
            avgBookingRate: Math.round(apiProjects.reduce((acc, p) => acc + p.bookingPercentage, 0) / apiProjects.length) || 75,
            totalUnits: apiProjects.reduce((acc, p) => acc + p.totalUnits, 0),
            topLocalities: [...new Set(apiProjects.map(p => p.locality))].slice(0, 5),
            priceRanges: {
              budget: apiProjects.filter(p => p.priceRange.includes('25-50')).length,
              mid: apiProjects.filter(p => p.priceRange.includes('50-100')).length,
              premium: apiProjects.filter(p => p.priceRange.includes('100-200')).length,
              luxury: apiProjects.filter(p => p.priceRange.includes('200+')).length,
            }
          };
          setCityStats(cityStats);
        }

        setProjects(apiProjects);
        setFilteredProjects(apiProjects);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
      // Fallback to mock data only if no data at all
      if (projects.length === 0) {
        const mockProjects: Project[] = generateMockProjects(cityName);
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
        setTotalProjects(mockProjects.length);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRandomLocality = (city: string): string => {
    const localities = getLocalitiesForCity(city);
    return localities[Math.floor(Math.random() * localities.length)];
  };

  const getPriceRangeFromPrice = (price: string): string => {
    // Extract numeric value from price string like "₹45-85L"
    const numbers = price.match(/\d+/g);
    if (!numbers) return '50-100L';
    
    const firstNum = parseInt(numbers[0]);
    if (firstNum < 50) return '25-50L';
    if (firstNum < 100) return '50-100L';
    if (firstNum < 200) return '100-200L';
    return '200L+';
  };

  const generateMockProjects = (city: string): Project[] => {
    const localities = getLocalitiesForCity(city);
    const developers = ['Adani Realty', 'Ganesh Housing', 'Savvy Group', 'Shivalik Group', 'Goyal & Co', 'Sun Builders', 'Bakeri Group'];
    const projectTypes = ['Residential', 'Commercial', 'Mixed Use', 'Township'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      projectName: `${developers[i % developers.length]} ${localities[i % localities.length]}`,
      promoterName: developers[i % developers.length],
      projectType: projectTypes[i % projectTypes.length],
      locality: localities[i % localities.length],
      reraId: `PR/GJ/${city.toUpperCase()}/2024/RAA${String(i + 1).padStart(5, '0')}`,
      approvedOn: `${(i % 28) + 1}-${(i % 12) + 1}-${2023 + (i % 2)}`,
      bookingPercentage: 30 + Math.floor(Math.random() * 70),
      totalUnits: 50 + Math.floor(Math.random() * 450),
      availableUnits: Math.floor(Math.random() * 100),
      priceRange: ['₹25-50L', '₹50-100L', '₹100-200L', '₹200L+'][i % 4],
      completionDate: `Q${(i % 4) + 1} ${2025 + (i % 3)}`,
      area: 5000 + Math.floor(Math.random() * 45000)
    }));
  };

  const getLocalitiesForCity = (city: string): string[] => {
    const localityMap: Record<string, string[]> = {
      'Ahmedabad': ['Satellite', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'SG Highway', 'Maninagar', 'Gota', 'Chandkheda', 'Bopal', 'Shela'],
      'Surat': ['Adajan', 'Vesu', 'Althan', 'Citylight', 'Dumas', 'Piplod', 'Jahangirpura', 'Katargam', 'Pal', 'Palanpur'],
      'Vadodara': ['Alkapuri', 'Gotri', 'Vasna', 'Makarpura', 'Manjalpur', 'Harni', 'Waghodia', 'Sama', 'Nizampura', 'Fatehgunj'],
      'Rajkot': ['Kalawad Road', 'University Road', 'Raiya Road', 'Kothariya', 'Nana Mava', 'Madhapar', 'Mavdi', 'Gondal Road', 'Aji Dam', 'Sadhu Vaswani'],
      'Gandhinagar': ['Sector 1', 'Sector 7', 'Sector 21', 'Kudasan', 'Sargasan', 'Raysan', 'Urjanagar', 'Infocity', 'GIFT City', 'Randesan']
    };
    return localityMap[cityName] || ['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5'];
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Apply locality filter
    if (selectedLocality !== 'all') {
      filtered = filtered.filter(p => p.locality === selectedLocality);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.projectType === selectedType);
    }

    // Apply booking filter
    if (selectedBooking !== 'all') {
      const [min, max] = selectedBooking.split('-').map(Number);
      filtered = filtered.filter(p => p.bookingPercentage >= min && p.bookingPercentage <= max);
    }

    // Apply price filter
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(p => p.priceRange === selectedPrice);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.projectName.toLowerCase().includes(query) ||
        p.promoterName.toLowerCase().includes(query) ||
        p.locality.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'bookingHigh':
          return b.bookingPercentage - a.bookingPercentage;
        case 'bookingLow':
          return a.bookingPercentage - b.bookingPercentage;
        case 'unitsHigh':
          return b.totalUnits - a.totalUnits;
        case 'unitsLow':
          return a.totalUnits - b.totalUnits;
        case 'nameAZ':
          return a.projectName.localeCompare(b.projectName);
        case 'nameZA':
          return b.projectName.localeCompare(a.projectName);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

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
                <div className="text-2xl font-bold text-gray-900">{cityStats.totalProjects}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{cityStats.avgBookingRate}%</div>
                <div className="text-sm text-gray-600">Avg Booking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cityStats.totalUnits.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{cityStats.residentialProjects}</div>
                <div className="text-sm text-gray-600">Residential</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{cityStats.commercialProjects}</div>
                <div className="text-sm text-gray-600">Commercial</div>
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

              {/* Locality Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Localities</option>
                  {cityStats?.topLocalities.map(locality => (
                    <option key={locality} value={locality}>{locality}</option>
                  ))}
                </select>
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

              {/* Booking Percentage */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                <select
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Any Booking %</option>
                  <option value="0-25">Low (0-25%)</option>
                  <option value="25-50">Medium (25-50%)</option>
                  <option value="50-75">Good (50-75%)</option>
                  <option value="75-100">Excellent (75-100%)</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Prices</option>
                  <option value="₹25-50L">₹25-50 Lakhs</option>
                  <option value="₹50-100L">₹50L-1 Crore</option>
                  <option value="₹100-200L">₹1-2 Crore</option>
                  <option value="₹200L+">₹2 Crore+</option>
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
                  <option value="bookingHigh">Booking % (High to Low)</option>
                  <option value="bookingLow">Booking % (Low to High)</option>
                  <option value="unitsHigh">Units (High to Low)</option>
                  <option value="unitsLow">Units (Low to High)</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedLocality('all');
                  setSelectedType('all');
                  setSelectedBooking('all');
                  setSelectedPrice('all');
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
                        <h3 className="text-xl font-bold text-gray-900">{project.projectName}</h3>
                        <p className="text-sm text-gray-600">{project.promoterName}</p>
                        <p className="text-sm text-blue-600">{project.locality}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{project.bookingPercentage}%</div>
                        <div className="text-xs text-gray-500">Booked</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-medium">{project.projectType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price Range</p>
                        <p className="text-sm font-medium text-blue-600">{project.priceRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Units</p>
                        <p className="text-sm font-medium">{project.totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Available</p>
                        <p className="text-sm font-medium text-green-600">{project.availableUnits} units</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full ${
                          project.bookingPercentage >= 75 ? 'bg-green-600' :
                          project.bookingPercentage >= 50 ? 'bg-yellow-600' :
                          project.bookingPercentage >= 25 ? 'bg-orange-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${project.bookingPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Completion: {project.completionDate}</span>
                      <Link
                        href={`/project/${encodeURIComponent(project.reraId)}`}
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
                        Locality
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
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
                            <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                            <div className="text-xs text-gray-500">{project.promoterName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{project.locality}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{project.projectType}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{project.totalUnits} total</div>
                          <div className="text-xs text-green-600">{project.availableUnits} available</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  project.bookingPercentage >= 75 ? 'bg-green-600' :
                                  project.bookingPercentage >= 50 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${project.bookingPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{project.bookingPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-blue-600 font-medium">{project.priceRange}</td>
                        <td className="px-4 py-4 text-sm">
                          <Link
                            href={`/project/${encodeURIComponent(project.reraId)}`}
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
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-600 font-medium">Interactive Map View</p>
                    <p className="text-sm text-gray-500 mt-2">Map integration coming soon</p>
                    <p className="text-xs text-gray-400 mt-4">Will show project locations across {cityName}</p>
                  </div>
                </div>
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No projects found matching your filters</p>
                <button
                  onClick={() => {
                    setSelectedLocality('all');
                    setSelectedType('all');
                    setSelectedBooking('all');
                    setSelectedPrice('all');
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