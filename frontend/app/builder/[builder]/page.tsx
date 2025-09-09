"use client";

import Link from 'next/link';
import UnderConstruction from '@/components/UnderConstruction';

export default function BuilderPortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <UnderConstruction 
          feature="Builder Portfolio" 
          message="Detailed builder profiles, project portfolios, and performance metrics will be available soon."
          icon="🏗️"
        />
      </div>
    </div>
  );
}