"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UnitDetail {
  unitType: string;
  configuration: string;
  carpetArea: number;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  priceRange: string;
}

interface ProjectDetail {
  // Basic Info
  projectName: string;
  reraId: string;
  developerName: string;
  projectType: string;
  projectStatus: string;
  
  // Location
  address: string;
  locality: string;
  city: string;
  district: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  
  // Project Details
  totalArea: number;
  totalUnits: number;
  totalBuildings: number;
  totalFloors: number;
  
  // Booking Status
  totalBooked: number;
  totalAvailable: number;
  bookingPercentage: number;
  lastUpdated: string;
  
  // Timeline
  projectStartDate: string;
  projectEndDate: string;
  revisedEndDate?: string;
  possessionDate: string;
  
  // Financial
  minPrice: number;
  maxPrice: number;
  avgPricePerSqFt: number;
  
  // Unit Details
  unitDetails: UnitDetail[];
  
  // Amenities
  amenities: string[];
  
  // Documents
  approvals: {
    landUse: boolean;
    environment: boolean;
    fireNOC: boolean;
    airport: boolean;
    municipality: boolean;
  };
  
  // Developer Info
  developerEmail: string;
  developerPhone: string;
  developerWebsite?: string;
  developerReraNo: string;
  
  // Analytics
  viewsCount: number;
  inquiriesCount: number;
  bookingTrend: Array<{
    month: string;
    bookings: number;
    percentage: number;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [params.id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/scraper/project/${encodeURIComponent(params.id as string)}`);
      const result = await response.json();
      
      if (result.success) {
        // Map API response to ProjectDetail interface
        const apiProject = result.data;
        const projectDetail: ProjectDetail = {
          projectName: apiProject.projectName,
          reraId: apiProject.reraId,
          developerName: apiProject.promoterName,
          projectType: apiProject.projectType,
          projectStatus: apiProject.status || "Registered",
      
      address: apiProject.address || "",
      locality: apiProject.locality || "",
      city: apiProject.district || "",
      district: apiProject.district || "",
      pincode: apiProject.pincode || "",
      latitude: 23.0225,  // Default coordinates for Ahmedabad
      longitude: 72.5714,
      
      totalArea: apiProject.projectArea || 0,
      totalUnits: apiProject.totalUnits || 0,
      totalBuildings: apiProject.totalBuildings || 0,
      totalFloors: 15,  // Not in real data
      
      totalBooked: (apiProject.totalUnits - apiProject.availableUnits) || 0,
      totalAvailable: apiProject.availableUnits || 0,
      bookingPercentage: apiProject.bookingPercentage || 0,
      lastUpdated: apiProject.lastUpdated || new Date().toISOString(),
      
      projectStartDate: apiProject.approvedOn || "",
      projectEndDate: apiProject.completionDate || "",
      revisedEndDate: apiProject.completionDate || "",
      possessionDate: apiProject.completionDate || "",
      
      minPrice: apiProject.minPrice || 0,
      maxPrice: apiProject.maxPrice || 0,
      avgPricePerSqFt: 4500,
      
      unitDetails: apiProject.unitDetails || [],
      
      amenities: apiProject.amenities || [],
      
      approvals: apiProject.approvals || {
        landUse: false,
        environment: false,
        fireNOC: false,
        airport: false,
        municipality: false
      },
      
      developerEmail: apiProject.developerEmail || "",
      developerPhone: apiProject.developerPhone || "",
      developerWebsite: apiProject.developerWebsite || "",
      developerReraNo: apiProject.reraId,
      
      viewsCount: 0,
      inquiriesCount: 0,
      
      bookingTrend: []
    };
    
        setProject(projectDetail);
      } else {
        console.error('Failed to fetch project:', result.error);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
              <p className="text-gray-600 mt-1">by {project.developerName}</p>
              <p className="text-sm text-gray-500 mt-1">RERA ID: {project.reraId}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{project.bookingPercentage}%</div>
              <div className="text-sm text-gray-600">Booked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {['overview', 'units', 'amenities', 'location', 'analytics', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Status Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Project Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{project.projectType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-green-600">{project.projectStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Area</p>
                    <p className="font-semibold">{project.totalArea.toLocaleString()} Sq.Mtr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="font-semibold">{project.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Buildings</p>
                    <p className="font-semibold">{project.totalBuildings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Floors</p>
                    <p className="font-semibold">{project.totalFloors}</p>
                  </div>
                </div>
              </div>

              {/* Booking Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Booking Status</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Booking</span>
                    <span className="text-sm font-semibold">{project.bookingPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      style={{ width: `${project.bookingPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{project.totalUnits}</p>
                    <p className="text-sm text-gray-600">Total Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{project.totalBooked}</p>
                    <p className="text-sm text-gray-600">Booked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{project.totalAvailable}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Last updated: {project.lastUpdated}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Project Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold">{project.projectStartDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Completion</span>
                    <span className="font-semibold">{project.projectEndDate}</span>
                  </div>
                  {project.revisedEndDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revised Completion</span>
                      <span className="font-semibold text-orange-600">{project.revisedEndDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Possession Date</span>
                    <span className="font-semibold text-green-600">{project.possessionDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Range */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Starting From</p>
                    <p className="text-2xl font-bold text-green-600">₹{(project.minPrice/100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Up To</p>
                    <p className="text-2xl font-bold text-blue-600">₹{(project.maxPrice/100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Price/Sq.Ft</p>
                    <p className="text-xl font-bold">₹{project.avgPricePerSqFt.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Developer Contact */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Developer Contact</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-blue-600">{project.developerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{project.developerPhone}</p>
                  </div>
                  {project.developerWebsite && (
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <p className="font-semibold text-blue-600">{project.developerWebsite}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">RERA No</p>
                    <p className="font-semibold">{project.developerReraNo}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Engagement Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Views</span>
                    <span className="font-bold">{project.viewsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inquiries</span>
                    <span className="font-bold">{project.inquiriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Score</span>
                    <span className="font-bold">8.5/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-6">Unit Details & Availability</h3>
            <div className="space-y-6">
              {project.unitDetails.map((unit, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">{unit.unitType}</h4>
                      <p className="text-gray-600">{unit.configuration}</p>
                      <p className="text-sm text-gray-500 mt-1">Carpet Area: {unit.carpetArea} Sq.Ft</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{unit.priceRange}</p>
                      <p className="text-sm text-gray-600">Price Range</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{unit.totalUnits}</p>
                      <p className="text-sm text-gray-600">Total Units</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-2xl font-bold text-red-600">{unit.bookedUnits}</p>
                      <p className="text-sm text-gray-600">Booked</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{unit.availableUnits}</p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                      style={{ width: `${(unit.bookedUnits / unit.totalUnits) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {((unit.bookedUnits / unit.totalUnits) * 100).toFixed(0)}% Booked
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-6">Project Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-6">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3">Address</h4>
                <p className="text-gray-700">{project.address}</p>
                <p className="text-gray-700">{project.locality}, {project.city}</p>
                <p className="text-gray-700">{project.district} - {project.pincode}</p>
                
                <h4 className="font-bold mt-6 mb-3">Nearby Landmarks</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Kotarpur Water Works - 500m</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>Nandagram Society - 200m</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    <span>SG Highway - 2.5km</span>
                  </li>
                </ul>
              </div>
              
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Map View (Integration Required)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold mb-6">Booking Trend Analysis</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {project.bookingTrend.map((month, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${month.percentage * 2}px` }}>
                      <div className="text-white text-xs text-center pt-2">{month.percentage}%</div>
                    </div>
                    <p className="text-xs mt-2">{month.month.split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold mb-3">Booking Velocity</h4>
                <p className="text-3xl font-bold text-green-600">2.3</p>
                <p className="text-sm text-gray-600">Units/Week</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold mb-3">Est. Completion Time</h4>
                <p className="text-3xl font-bold text-blue-600">8</p>
                <p className="text-sm text-gray-600">Months</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold mb-3">Market Performance</h4>
                <p className="text-3xl font-bold text-purple-600">A+</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-6">Regulatory Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(project.approvals).map(([key, value]) => (
                <div key={key} className={`p-4 rounded-lg border-2 ${value ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {value ? (
                      <span className="text-green-600 font-bold">Approved</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
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