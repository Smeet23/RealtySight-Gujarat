"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CITIES = [
  { name: 'Ahmedabad', path: '/city/ahmedabad', emoji: '🏙️' },
  { name: 'Surat', path: '/city/surat', emoji: '💎' },
  { name: 'Vadodara', path: '/city/vadodara', emoji: '🏛️' },
  { name: 'Rajkot', path: '/city/rajkot', emoji: '🌆' },
  { name: 'Gandhinagar', path: '/city/gandhinagar', emoji: '🏢' },
  { name: 'Bhavnagar', path: '/city/bhavnagar', emoji: '⚓' },
  { name: 'Jamnagar', path: '/city/jamnagar', emoji: '🏭' },
  { name: 'Junagadh', path: '/city/junagadh', emoji: '🏔️' },
];

export default function CityNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">RERA Gujarat</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Cities
            </Link>
            <Link
              href="/analytics"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${
                pathname === '/analytics' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>📊</span>
              <span>Analytics</span>
            </Link>
            {CITIES.map((city) => (
              <Link
                key={city.path}
                href={city.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${
                  pathname === city.path 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{city.emoji}</span>
                <span>{city.name}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <select 
              value={pathname}
              onChange={(e) => window.location.href = e.target.value}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="/">All Cities</option>
              <option value="/analytics">📊 Analytics</option>
              {CITIES.map((city) => (
                <option key={city.path} value={city.path}>
                  {city.emoji} {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}