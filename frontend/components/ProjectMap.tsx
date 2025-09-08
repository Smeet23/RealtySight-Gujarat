'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';
import '../lib/leaflet-config';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Project {
  projectName: string;
  promoterName: string;
  locality?: string;
  district: string;
  pincode: string;
  price?: string;
  bookingPercentage: number;
  coordinates?: [number, number];
}

interface ProjectMapProps {
  projects: Project[];
  center?: LatLngExpression;
  zoom?: number;
}

// Gujarat city coordinates
const cityCoordinates: Record<string, [number, number]> = {
  'Ahmedabad': [23.0225, 72.5714],
  'Surat': [21.1702, 72.8311],
  'Vadodara': [22.3072, 73.1812],
  'Rajkot': [22.3039, 70.8022],
  'Gandhinagar': [23.2156, 72.6369],
  'Bhavnagar': [21.7645, 72.1519],
  'Jamnagar': [22.4707, 70.0577],
  'Junagadh': [21.5222, 70.4579],
  'Anand': [22.5645, 72.9289],
  'Vapi': [20.3893, 72.9106]
};

// Locality coordinates for major areas
const localityCoordinates: Record<string, [number, number]> = {
  // Gandhinagar localities
  'Sargasan': [23.1848, 72.6158],
  'Kudasan': [23.1857, 72.6301],
  'GIFT City': [23.1645, 72.6847],
  'Raysan': [23.2419, 72.6369],
  'Randesan': [23.2156, 72.6500],
  'Adalaj': [23.1659, 72.5516],
  'Koba': [23.2800, 72.6800],
  'Chandkheda': [23.1068, 72.5966],
  'Motera': [23.1068, 72.5999],
  
  // Ahmedabad localities
  'Satellite': [23.0308, 72.5097],
  'Vastrapur': [23.0361, 72.5292],
  'Maninagar': [22.9998, 72.6022],
  'Bopal': [23.0361, 72.4789],
  'Science City': [23.0785, 72.4973],
  'SG Highway': [23.0395, 72.5065],
  'Thaltej': [23.0515, 72.5073],
  'Bodakdev': [23.0364, 72.5006],
  
  // Add more localities as needed
};

export default function ProjectMap({ projects, center, zoom = 11 }: ProjectMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [projectsWithCoords, setProjectsWithCoords] = useState<Project[]>([]);

  useEffect(() => {
    setMapReady(true);
    
    // Add coordinates to projects based on locality or city
    const projectsWithLocation = projects.map(project => {
      let coordinates: [number, number] | undefined;
      
      // First try to find locality coordinates
      if (project.locality && localityCoordinates[project.locality]) {
        coordinates = localityCoordinates[project.locality];
      } 
      // Fall back to city coordinates
      else if (cityCoordinates[project.district]) {
        // Add small random offset to prevent overlapping markers
        const cityCoord = cityCoordinates[project.district];
        coordinates = [
          cityCoord[0] + (Math.random() - 0.5) * 0.05,
          cityCoord[1] + (Math.random() - 0.5) * 0.05
        ];
      }
      
      return { ...project, coordinates };
    }).filter(p => p.coordinates); // Only include projects with coordinates
    
    setProjectsWithCoords(projectsWithLocation);
  }, [projects]);

  // Determine map center
  const mapCenter = center || 
    (projectsWithCoords.length > 0 && projectsWithCoords[0].coordinates) || 
    cityCoordinates['Gandhinagar'];

  if (!mapReady) {
    return <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />;
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projectsWithCoords.map((project, index) => (
          <Marker key={index} position={project.coordinates!}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">{project.projectName}</h3>
                <p className="text-xs text-gray-600">{project.promoterName}</p>
                <p className="text-xs">
                  {project.locality && `${project.locality}, `}{project.district}
                </p>
                {project.price && (
                  <p className="text-xs font-semibold text-green-600">{project.price}</p>
                )}
                <p className="text-xs">
                  Booking: <span className="font-semibold">{project.bookingPercentage}%</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}