"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UnderConstruction from '@/components/UnderConstruction';

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
      const response = await fetch(`/api/project/${encodeURIComponent(params.id as string)}`);
      const result = await response.json();
      
      if (result.success && result.project) {
        // Map API response to ProjectDetail interface
        const apiProject = result.project;
        const projectDetail: ProjectDetail = {
          projectName: apiProject.name || 'Unknown Project',
          reraId: apiProject.registrationNo || apiProject.id,
          developerName: apiProject.developer || 'Unknown Developer',
          projectType: apiProject.type || 'Residential',
          projectStatus: apiProject.status || "Ongoing",
      
      address: apiProject.location || apiProject.address || "",
      locality: apiProject.locality || "",
      city: apiProject.city || "",
      district: apiProject.district || apiProject.city || "",
      pincode: apiProject.pincode || "",
      latitude: apiProject.latitude,
      longitude: apiProject.longitude,
      
      totalArea: parseFloat(apiProject.totalArea) || 0,
      totalUnits: apiProject.totalUnits || 0,
      totalBuildings: apiProject.totalBuildings || 1,
      totalFloors: apiProject.totalFloors || 0,
      
      totalBooked: 0,
      totalAvailable: apiProject.totalUnits || 0,
      bookingPercentage: 0,
      lastUpdated: new Date().toISOString(),
      
      projectStartDate: apiProject.startDate || apiProject.approvedDate || "",
      projectEndDate: apiProject.completionDate || "",
      revisedEndDate: apiProject.completionDate || "",
      possessionDate: apiProject.completionDate || "",
      
      minPrice: 0,
      maxPrice: 0,
      avgPricePerSqFt: 0,
      
      unitDetails: apiProject.unitDetails || [],
      
      amenities: apiProject.amenities || [],
      
      approvals: apiProject.approvals || {
        landUse: false,
        environment: false,
        fireNOC: false,
        airport: false,
        municipality: false
      },
      
      developerEmail: apiProject.email || apiProject.contact?.email || "",
      developerPhone: apiProject.phone || apiProject.contact?.phone || "",
      developerWebsite: "",
      developerReraNo: apiProject.registrationNo || apiProject.id,
      
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.projectStatus === 'Ongoing' ? 'bg-green-100 text-green-800' : 
                project.projectStatus === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.projectStatus}
              </span>
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
                </div>
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

            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <UnderConstruction 
            feature="Unit Details & Availability" 
            message="Detailed unit information including floor plans, pricing, and availability will be available soon."
            icon="🏢"
          />
        )}

        {activeTab === 'amenities' && (
          <UnderConstruction 
            feature="Project Amenities" 
            message="Complete list of amenities and facilities will be updated soon."
            icon="🏊"
          />
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
              
              <UnderConstruction 
                feature="Interactive Map" 
                message="Interactive map with location details coming soon."
                icon="🗺️"
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <UnderConstruction 
            feature="Analytics & Insights" 
            message="Detailed analytics, booking trends, and market insights will be available soon."
            icon="📊"
          />
        )}

        {activeTab === 'documents' && (
          <UnderConstruction 
            feature="Documents & Approvals" 
            message="Regulatory approvals and project documents will be available soon."
            icon="📄"
          />
        )}
      </div>
    </div>
  );
}