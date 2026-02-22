'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as api from '@/lib/api';
import toast from 'react-hot-toast';

interface Region {
  id: number;
  name: string;
  code: string;
}

interface Town {
  id: number;
  name: string;
  regionId: number;
}

interface BusStation {
  id: number;
  name: string;
  address: string;
  townId: number;
}

interface DeliveryFee {
  id: number;
  townId: number;
  method: 'BUS_STATION' | 'HOME_DELIVERY';
  fee: number;
  estimatedDays: number;
}

interface DeliveryContextType {
  regions: Region[];
  towns: Town[];
  stations: BusStation[];
  fees: DeliveryFee[];
  loading: boolean;
  loadTowns: (regionId: number) => Promise<void>;
  loadStations: (townId: number) => Promise<void>;
  loadFees: (townId: number, method: 'BUS_STATION' | 'HOME_DELIVERY') => Promise<void>;
  getDeliveryFee: (townId: number, method: 'BUS_STATION' | 'HOME_DELIVERY') => DeliveryFee | null;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [stations, setStations] = useState<BusStation[]>([]);
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [loading, setLoading] = useState(false);

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        if (!api.deliveryApi || typeof api.deliveryApi.getRegions !== 'function') {
          console.warn('deliveryApi.getRegions is not available');
          toast.error('Delivery API not available');
          return;
        }

        const response = await api.deliveryApi.getRegions();
        setRegions(response?.regions || []);
      } catch (error) {
        console.error('Failed to load regions:', error);
        toast.error('Failed to load delivery regions');
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  const loadTowns = useCallback(async (regionId: number) => {
      try {
      setLoading(true);
      if (!api.deliveryApi || typeof api.deliveryApi.getTowns !== 'function') {
        console.warn('deliveryApi.getTowns is not available');
        toast.error('Delivery API not available');
        return;
      }

      const response = await api.deliveryApi.getTowns(regionId);
      setTowns(response?.towns || []);
      // Clear stations when region changes
      setStations([]);
    } catch (error) {
      console.error('Failed to load towns:', error);
      toast.error('Failed to load towns');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStations = useCallback(async (townId: number) => {
      try {
      setLoading(true);
      if (!api.deliveryApi || typeof api.deliveryApi.getStations !== 'function') {
        console.warn('deliveryApi.getStations is not available');
        toast.error('Delivery API not available');
        return;
      }

      const response = await api.deliveryApi.getStations(townId);
      setStations(response?.stations || []);
    } catch (error) {
      console.error('Failed to load bus stations:', error);
      toast.error('Failed to load bus stations');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFees = useCallback(async (townId: number, method: 'BUS_STATION' | 'HOME_DELIVERY') => {
      try {
      setLoading(true);
      if (!api.deliveryApi || typeof api.deliveryApi.getFees !== 'function') {
        console.warn('deliveryApi.getFees is not available');
        toast.error('Delivery API not available');
        return;
      }

      const response = await api.deliveryApi.getFees({ townId, method });
      setFees((response?.fees || []) as DeliveryFee[]);
    } catch (error) {
      console.error('Failed to load delivery fees:', error);
      toast.error('Failed to load delivery fees');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliveryFee = useCallback((townId: number, method: 'BUS_STATION' | 'HOME_DELIVERY'): DeliveryFee | null => {
    return fees.find(fee => fee.townId === townId && fee.method === method) || null;
  }, [fees]);

  const value: DeliveryContextType = {
    regions,
    towns,
    stations,
    fees,
    loading,
    loadTowns,
    loadStations,
    loadFees,
    getDeliveryFee,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within DeliveryProvider');
  }
  return context;
}
