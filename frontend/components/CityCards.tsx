"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CityData {
  city: string;
  count: number;
  ongoing: number;
  completed: number;
  new: number;
  totalValue: number;
}

export default function CityCards() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityData();
  }, []);

  const fetchCityData = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCityImage = (city: string) => {
    const images: Record<string, string> = {
      'Ahmedabad': '🏙️',
      'Surat': '💎',
      'Vadodara': '🏛️',
      'Rajkot': '🌆',
      'Gandhinagar': '🏢',
      'Bhavnagar': '⚓',
      'Jamnagar': '🏭',
      'Junagadh': '🏔️'
    };
    return images[city] || '🌃';
  };

  const formatValue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Projects by City</h2>
        <div className="text-sm text-gray-600">
          Total Cities: {cities.length} | Total Projects: {cities.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cities.map((city) => (
          <Link
            key={city.city}
            href={`/city/${city.city.toLowerCase()}`}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300">
              {/* City Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl mb-2">{getCityImage(city.city)}</div>
                    <h3 className="text-xl font-bold">{city.city}</h3>
                    <p className="text-blue-100 text-sm mt-1">{city.count.toLocaleString()} Projects</p>
                  </div>
                  <div className="text-4xl font-bold opacity-20">
                    {city.count}
                  </div>
                </div>
              </div>

              {/* City Stats */}
              <div className="p-6 space-y-4">
                {/* Status Distribution */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongoing</span>
                    <span className="font-semibold text-green-600">{city.ongoing}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New</span>
                    <span className="font-semibold text-blue-600">{city.new}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-600">{city.completed}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Project Distribution</span>
                    <span>{((city.ongoing / city.count) * 100).toFixed(0)}% Active</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-green-500"
                        style={{ width: `${(city.ongoing / city.count) * 100}%` }}
                      />
                      <div 
                        className="bg-blue-500"
                        style={{ width: `${(city.new / city.count) * 100}%` }}
                      />
                      <div 
                        className="bg-gray-400"
                        style={{ width: `${(city.completed / city.count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Value */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total Value</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatValue(city.totalValue)}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-2">
                  <div className="flex items-center justify-center py-2 px-4 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                    <span className="text-blue-600 font-medium text-sm">View All Projects</span>
                    <svg className="w-4 h-4 ml-2 text-blue-600 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{cities.length}</div>
            <div className="text-indigo-100 text-sm">Total Cities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {cities.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
            </div>
            <div className="text-indigo-100 text-sm">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {cities.reduce((sum, c) => sum + c.ongoing, 0).toLocaleString()}
            </div>
            <div className="text-indigo-100 text-sm">Ongoing Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {formatValue(cities.reduce((sum, c) => sum + c.totalValue, 0))}
            </div>
            <div className="text-indigo-100 text-sm">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}