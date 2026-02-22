'use client';

import { useEffect, useState } from 'react';
import { useDelivery } from '@/context/DeliveryContext';

interface BusStationSelectorProps {
  selectedRegion: number | null;
  selectedTown: number | null;
  selectedStation: number | null;
  onRegionSelect: (regionId: number) => void;
  onTownSelect: (townId: number) => void;
  onStationSelect: (stationId: number, stationName: string) => void;
  loading?: boolean;
}

/**
 * BusStationSelector Component
 * 
 * Cascading dropdowns for selecting:
 * Region → Town → Bus Station
 * 
 * Uses DeliveryContext for centralized delivery data management.
 * Used in checkout for bus station pickup delivery method.
 */
export default function BusStationSelector({
  selectedRegion,
  selectedTown,
  selectedStation,
  onRegionSelect,
  onTownSelect,
  onStationSelect,
  loading = false,
}: BusStationSelectorProps) {
  const { 
    regions, 
    towns, 
    stations, 
    loading: contextLoading,
    loadTowns,
    loadStations
  } = useDelivery();

  const [error, setError] = useState<string | null>(null);

  // Load towns when region changes
  useEffect(() => {
    if (selectedRegion) {
      loadTowns(selectedRegion);
    }
  }, [selectedRegion, loadTowns]);

  // Load stations when town changes
  useEffect(() => {
    if (selectedTown) {
      const loadStationsData = async () => {
        try {
          setError(null);
          await loadStations(selectedTown);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load bus stations';
          setError(message);
          console.error('Error loading stations:', err);
        }
      };

      loadStationsData();
    }
  }, [selectedTown, loadStations]);

  const handleStationChange = (stationId: number) => {
    const station = stations.find((s) => s.id === stationId);
    if (station) {
      onStationSelect(stationId, station.name);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900">Select Bus Station Pickup Location</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Region Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region *
        </label>
        <select
          value={selectedRegion || ''}
          onChange={(e) => onRegionSelect(Number(e.target.value))}
          disabled={loading || contextLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Town Dropdown */}
      {selectedRegion && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Town *
          </label>
          <select
            value={selectedTown || ''}
            onChange={(e) => onTownSelect(Number(e.target.value))}
            disabled={loading || contextLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a town</option>
            {towns.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Station Dropdown */}
      {selectedTown && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bus Station *
          </label>
          <select
            value={selectedStation || ''}
            onChange={(e) => handleStationChange(Number(e.target.value))}
            disabled={loading || contextLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a bus station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {(contextLoading || loading) && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
}