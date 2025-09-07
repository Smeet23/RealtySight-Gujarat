"use client";

import { useState } from 'react';

interface SearchFilterProps {
  onSearch: (filters: any) => void;
  cities: string[];
}

export default function SearchFilter({ onSearch, cities }: SearchFilterProps) {
  const [filters, setFilters] = useState({
    searchText: '',
    city: '',
    projectType: '',
    bookingStatus: '',
    priceRange: '',
    developer: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const projectTypes = [
    'Residential/Group Housing',
    'Commercial',
    'Plotted Development',
    'Mixed Development'
  ];

  const bookingStatuses = [
    { value: '0-25', label: 'Low Booking (0-25%)' },
    { value: '25-50', label: 'Medium Booking (25-50%)' },
    { value: '50-75', label: 'Good Booking (50-75%)' },
    { value: '75-100', label: 'High Booking (75-100%)' },
    { value: '100', label: 'Sold Out (100%)' }
  ];

  const priceRanges = [
    { value: '0-50', label: 'Under ₹50 Lakhs' },
    { value: '50-100', label: '₹50L - ₹1 Crore' },
    { value: '100-200', label: '₹1-2 Crore' },
    { value: '200+', label: 'Above ₹2 Crore' }
  ];

  const handleChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchText: '',
      city: '',
      projectType: '',
      bookingStatus: '',
      priceRange: '',
      developer: ''
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Search & Filter Projects</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Main Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by project name, developer, or RERA ID..."
            value={filters.searchText}
            onChange={(e) => handleChange('searchText', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => onSearch(filters)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <select
          value={filters.city}
          onChange={(e) => handleChange('city', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={filters.projectType}
          onChange={(e) => handleChange('projectType', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {projectTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filters.bookingStatus}
          onChange={(e) => handleChange('bookingStatus', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Booking %</option>
          {bookingStatuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => handleChange('priceRange', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Price</option>
          {priceRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        {showAdvanced ? '− Hide' : '+ Show'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer Name
              </label>
              <input
                type="text"
                placeholder="Enter developer name"
                value={filters.developer}
                onChange={(e) => handleChange('developer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Year
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Any Year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Any Amenities</option>
                <option value="swimming-pool">Swimming Pool</option>
                <option value="gym">Gym</option>
                <option value="club-house">Club House</option>
                <option value="parking">Covered Parking</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Filters
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">RERA Approved Only</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Ready to Move</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Under Construction</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">New Launch</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Premium Projects</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {key}: {value}
                <button
                  onClick={() => handleChange(key, '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}