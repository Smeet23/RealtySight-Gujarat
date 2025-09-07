"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BuilderProject {
  id: string;
  projectName: string;
  location: string;
  city: string;
  projectType: string;
  totalUnits: number;
  availableUnits: number;
  bookingPercentage: number;
  price: string;
  completionDate: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  reraId: string;
}

interface BuilderData {
  name: string;
  established: string;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  totalUnitsDelivered: number;
  avgCustomerRating: number;
  specialization: string[];
  presence: string[];
  certifications: string[];
  awards: string[];
  description: string;
  contact: {
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  projects: BuilderProject[];
  statistics: {
    avgBookingRate: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    repeatCustomers: number;
  };
}

export default function BuilderPortfolioPage() {
  const params = useParams();
  const builderSlug = params.builder as string;
  const [viewMode, setViewMode] = useState<'portfolio' | 'projects' | 'analytics'>('portfolio');
  const [projectFilter, setProjectFilter] = useState<'all' | 'ongoing' | 'completed' | 'upcoming'>('all');

  const getBuilderData = (slug: string): BuilderData => {
    const builders: Record<string, BuilderData> = {
      'adani-realty': {
        name: 'Adani Realty',
        established: '2012',
        totalProjects: 28,
        completedProjects: 12,
        ongoingProjects: 14,
        totalUnitsDelivered: 8500,
        avgCustomerRating: 4.5,
        specialization: ['Luxury Residential', 'Townships', 'Commercial Spaces'],
        presence: ['Ahmedabad', 'Mumbai', 'Pune', 'Gurgaon'],
        certifications: ['ISO 9001:2015', 'IGBC Gold Certified', 'RERA Registered'],
        awards: [
          'Best Township Project 2023',
          'Developer of the Year 2022',
          'Green Building Excellence Award'
        ],
        description: 'Adani Realty, the real estate arm of the Adani Group, has been creating landmarks that redefine skylines and lifestyles. With a commitment to quality, innovation, and sustainability.',
        contact: {
          email: 'info@adanirealty.com',
          phone: '+91 79 2555 5555',
          website: 'www.adanirealty.com',
          address: 'Adani House, Near Mithakhali Circle, Ahmedabad'
        },
        projects: [
          {
            id: '1',
            projectName: 'Adani Shantigram',
            location: 'S.G. Highway',
            city: 'Ahmedabad',
            projectType: 'Township',
            totalUnits: 2500,
            availableUnits: 450,
            bookingPercentage: 82,
            price: '₹85L - 2.5Cr',
            completionDate: 'Dec 2025',
            status: 'Ongoing',
            reraId: 'PR/GJ/AHMEDABAD/123/2023'
          },
          {
            id: '2',
            projectName: 'Adani Samsara',
            location: 'Sector 60',
            city: 'Gurgaon',
            projectType: 'Luxury Residential',
            totalUnits: 1100,
            availableUnits: 200,
            bookingPercentage: 82,
            price: '₹1.2Cr - 3.5Cr',
            completionDate: 'Mar 2026',
            status: 'Ongoing',
            reraId: 'PR/HR/GURGAON/456/2023'
          },
          {
            id: '3',
            projectName: 'Adani Western Heights',
            location: 'Andheri West',
            city: 'Mumbai',
            projectType: 'Residential',
            totalUnits: 800,
            availableUnits: 0,
            bookingPercentage: 100,
            price: '₹2Cr - 5Cr',
            completionDate: 'Jun 2023',
            status: 'Completed',
            reraId: 'PR/MH/MUMBAI/789/2021'
          }
        ],
        statistics: {
          avgBookingRate: 85,
          onTimeDelivery: 92,
          customerSatisfaction: 88,
          repeatCustomers: 35
        }
      },
      'safal-group': {
        name: 'Safal Group',
        established: '1992',
        totalProjects: 45,
        completedProjects: 32,
        ongoingProjects: 10,
        totalUnitsDelivered: 12000,
        avgCustomerRating: 4.3,
        specialization: ['Affordable Housing', 'Mid-segment Residential', 'Commercial'],
        presence: ['Ahmedabad', 'Gandhinagar', 'Vadodara'],
        certifications: ['ISO 9001:2015', 'RERA Registered'],
        awards: [
          'Affordable Housing Excellence 2023',
          'Best Mid-Segment Developer 2022'
        ],
        description: 'Safal Group has been a trusted name in Gujarat real estate for over 30 years, known for quality construction and timely delivery.',
        contact: {
          email: 'contact@safalgroup.com',
          phone: '+91 79 2640 2640',
          website: 'www.safalgroup.com',
          address: 'Safal House, Prahlad Nagar, Ahmedabad'
        },
        projects: [
          {
            id: '4',
            projectName: 'Safal Parishkaar',
            location: 'Prahlad Nagar',
            city: 'Ahmedabad',
            projectType: 'Residential',
            totalUnits: 350,
            availableUnits: 45,
            bookingPercentage: 87,
            price: '₹45L - 85L',
            completionDate: 'Sep 2024',
            status: 'Ongoing',
            reraId: 'PR/GJ/AHMEDABAD/234/2023'
          },
          {
            id: '5',
            projectName: 'Safal Signatura',
            location: 'Bodakdev',
            city: 'Ahmedabad',
            projectType: 'Luxury Residential',
            totalUnits: 180,
            availableUnits: 20,
            bookingPercentage: 89,
            price: '₹1.2Cr - 2.8Cr',
            completionDate: 'Mar 2025',
            status: 'Ongoing',
            reraId: 'PR/GJ/AHMEDABAD/345/2023'
          }
        ],
        statistics: {
          avgBookingRate: 82,
          onTimeDelivery: 88,
          customerSatisfaction: 85,
          repeatCustomers: 42
        }
      },
      'ganesh-housing': {
        name: 'Ganesh Housing',
        established: '1999',
        totalProjects: 38,
        completedProjects: 28,
        ongoingProjects: 8,
        totalUnitsDelivered: 9500,
        avgCustomerRating: 4.4,
        specialization: ['Premium Residential', 'Villas', 'Integrated Townships'],
        presence: ['Ahmedabad', 'Gandhinagar', 'Surat'],
        certifications: ['ISO 9001:2015', 'IGBC Certified', 'RERA Registered'],
        awards: [
          'Best Residential Project 2023',
          'Excellence in Construction 2022'
        ],
        description: 'Ganesh Housing Corporation Limited is one of the most trusted real estate developers in Gujarat, known for innovative designs and quality construction.',
        contact: {
          email: 'info@ganeshhousing.com',
          phone: '+91 79 4002 3000',
          website: 'www.ganeshhousing.com',
          address: 'Ganesh House, S.G. Highway, Ahmedabad'
        },
        projects: [
          {
            id: '6',
            projectName: 'Ganesh Maple Tree',
            location: 'S.G. Highway',
            city: 'Ahmedabad',
            projectType: 'Residential',
            totalUnits: 450,
            availableUnits: 35,
            bookingPercentage: 92,
            price: '₹65L - 1.5Cr',
            completionDate: 'Jun 2024',
            status: 'Ongoing',
            reraId: 'PR/GJ/AHMEDABAD/456/2023'
          }
        ],
        statistics: {
          avgBookingRate: 87,
          onTimeDelivery: 90,
          customerSatisfaction: 89,
          repeatCustomers: 38
        }
      }
    };

    const defaultBuilder: BuilderData = {
      name: builderSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      established: '2010',
      totalProjects: 15,
      completedProjects: 8,
      ongoingProjects: 5,
      totalUnitsDelivered: 3000,
      avgCustomerRating: 4.0,
      specialization: ['Residential', 'Commercial'],
      presence: ['Ahmedabad'],
      certifications: ['RERA Registered'],
      awards: [],
      description: 'A trusted name in real estate development.',
      contact: {
        email: 'info@developer.com',
        phone: '+91 79 0000 0000',
        website: 'www.developer.com',
        address: 'Ahmedabad, Gujarat'
      },
      projects: [],
      statistics: {
        avgBookingRate: 75,
        onTimeDelivery: 80,
        customerSatisfaction: 78,
        repeatCustomers: 25
      }
    };

    return builders[slug] || defaultBuilder;
  };

  const builderData = getBuilderData(builderSlug);
  
  const filteredProjects = builderData.projects.filter(project => {
    if (projectFilter === 'all') return true;
    return project.status.toLowerCase() === projectFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="text-blue-100 hover:text-white text-sm">
            ← Back to Dashboard
          </Link>
          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{builderData.name}</h1>
              <p className="text-blue-100 mb-4">Established {builderData.established} • {builderData.totalUnitsDelivered.toLocaleString()}+ Units Delivered</p>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.floor(builderData.avgCustomerRating) ? 'text-yellow-400' : 'text-gray-400'}`}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-white">{builderData.avgCustomerRating}/5</span>
                </div>
                <span className="text-blue-100">|</span>
                <span className="text-blue-100">{builderData.totalProjects} Total Projects</span>
              </div>
            </div>
            <div className="text-right">
              <a href={`mailto:${builderData.contact.email}`} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition inline-block mb-2">
                Contact Builder
              </a>
              <p className="text-sm text-blue-100">{builderData.contact.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setViewMode('portfolio')}
              className={`py-4 border-b-2 font-medium transition ${viewMode === 'portfolio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              Portfolio Overview
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`py-4 border-b-2 font-medium transition ${viewMode === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              Projects ({builderData.projects.length})
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`py-4 border-b-2 font-medium transition ${viewMode === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              Performance Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {viewMode === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">About {builderData.name}</h2>
                <p className="text-gray-700 mb-4">{builderData.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-sm text-gray-600">Specialization</span>
                    <div className="mt-1">
                      {builderData.specialization.map((spec, i) => (
                        <span key={i} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm mr-2 mb-2">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Presence</span>
                    <div className="mt-1">
                      {builderData.presence.map((city, i) => (
                        <span key={i} className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-sm mr-2 mb-2">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{builderData.totalProjects}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Projects</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{builderData.completedProjects}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{builderData.ongoingProjects}</div>
                  <div className="text-sm text-gray-600 mt-1">Ongoing</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{builderData.totalUnitsDelivered.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">Units Delivered</div>
                </div>
              </div>

              {/* Awards & Certifications */}
              {(builderData.awards.length > 0 || builderData.certifications.length > 0) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-4">Recognition & Certifications</h3>
                  {builderData.awards.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Awards</h4>
                      <ul className="space-y-2">
                        {builderData.awards.map((award, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">🏆</span>
                            <span className="text-gray-700">{award}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {builderData.certifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {builderData.certifications.map((cert, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Email</span>
                    <p className="text-gray-900">{builderData.contact.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone</span>
                    <p className="text-gray-900">{builderData.contact.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Website</span>
                    <p className="text-blue-600">{builderData.contact.website}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Office Address</span>
                    <p className="text-gray-900">{builderData.contact.address}</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Schedule Site Visit
                </button>
              </div>

              {/* Performance Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Avg Booking Rate</span>
                      <span className="text-sm font-medium">{builderData.statistics.avgBookingRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${builderData.statistics.avgBookingRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">On-Time Delivery</span>
                      <span className="text-sm font-medium">{builderData.statistics.onTimeDelivery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${builderData.statistics.onTimeDelivery}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-sm font-medium">{builderData.statistics.customerSatisfaction}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${builderData.statistics.customerSatisfaction}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Repeat Customers</span>
                      <span className="text-sm font-medium">{builderData.statistics.repeatCustomers}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${builderData.statistics.repeatCustomers}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'projects' && (
          <div>
            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                <div className="flex gap-2">
                  {(['all', 'ongoing', 'completed', 'upcoming'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setProjectFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        projectFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {status === 'all' && ` (${builderData.projects.length})`}
                      {status !== 'all' && ` (${builderData.projects.filter(p => p.status.toLowerCase() === status).length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{project.projectName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{project.location}, {project.city}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{project.projectType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-blue-600">{project.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completion:</span>
                        <span className="font-medium">{project.completionDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{project.availableUnits}/{project.totalUnits} units</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Booking Progress</span>
                        <span className="text-xs font-medium">{project.bookingPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            project.bookingPercentage >= 80 ? 'bg-green-600' :
                            project.bookingPercentage >= 50 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${project.bookingPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/project/${project.reraId}`}
                        className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition text-sm">
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found matching the selected filter.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{builderData.statistics.avgBookingRate}%</div>
                    <div className="text-sm text-gray-600">Average Booking Rate</div>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{builderData.statistics.onTimeDelivery}%</div>
                    <div className="text-sm text-gray-600">On-Time Delivery</div>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{builderData.statistics.customerSatisfaction}%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                  <div className="text-4xl">😊</div>
                </div>
              </div>
            </div>

            {/* Project Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Project Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Completed Projects</span>
                    <span className="text-sm font-medium">{builderData.completedProjects}/{builderData.totalProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(builderData.completedProjects / builderData.totalProjects) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Ongoing Projects</span>
                    <span className="text-sm font-medium">{builderData.ongoingProjects}/{builderData.totalProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-600 h-3 rounded-full" style={{ width: `${(builderData.ongoingProjects / builderData.totalProjects) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Upcoming Projects</span>
                    <span className="text-sm font-medium">{builderData.totalProjects - builderData.completedProjects - builderData.ongoingProjects}/{builderData.totalProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${((builderData.totalProjects - builderData.completedProjects - builderData.ongoingProjects) / builderData.totalProjects) * 100}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{builderData.totalUnitsDelivered.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Units Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{builderData.statistics.repeatCustomers}%</div>
                    <div className="text-xs text-gray-600">Repeat Customers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Position */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-lg font-bold mb-4">Market Position & Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Market Rank</div>
                  <div className="text-3xl font-bold text-indigo-600">#3</div>
                  <div className="text-xs text-gray-500">in Gujarat</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Vs Industry Avg</div>
                  <div className="text-2xl font-bold text-green-600">+12%</div>
                  <div className="text-xs text-gray-500">Booking Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Growth Rate</div>
                  <div className="text-2xl font-bold text-blue-600">18%</div>
                  <div className="text-xs text-gray-500">YoY</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Market Share</div>
                  <div className="text-2xl font-bold text-purple-600">8.5%</div>
                  <div className="text-xs text-gray-500">in Ahmedabad</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}