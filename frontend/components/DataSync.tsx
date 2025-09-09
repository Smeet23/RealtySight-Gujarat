"use client";

import { useState } from 'react';

export default function DataSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const syncData = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/sync-data');
      const result = await response.json();
      setSyncResult(result);
      
      if (result.success) {
        // Refresh the page after successful sync
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error: 'Failed to sync data'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-yellow-900">Data Sync Required</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Click the button to fetch the latest RERA project data from Gujarat government portal
          </p>
        </div>
        <button
          onClick={syncData}
          disabled={syncing}
          className={`px-6 py-2 rounded-lg font-medium ${
            syncing 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          {syncing ? 'Syncing (this may take a minute)...' : 'Sync Data'}
        </button>
      </div>
      
      {syncResult && (
        <div className={`mt-4 p-3 rounded ${
          syncResult.success 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {syncResult.success 
            ? `✓ Successfully synced ${syncResult.projectsCount} projects. Refreshing...` 
            : `✗ Error: ${syncResult.error || syncResult.message}`}
        </div>
      )}
    </div>
  );
}