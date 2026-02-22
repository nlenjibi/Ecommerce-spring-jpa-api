'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserAddress } from '@/types';
import * as api from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface AddressContextType {
  addresses: UserAddress[];
  defaultAddress: UserAddress | null;
  loading: boolean;
  refreshAddresses: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<UserAddress>;
  updateAddress: (id: number, address: Partial<UserAddress>) => Promise<UserAddress>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }

    try {
      setLoading(true);
      if (!api.addressesApi || typeof api.addressesApi.getAll !== 'function') {
        console.warn('addressesApi.getAll is not available');
        toast.error('Addresses API not available');
        return;
      }

      const response = await api.addressesApi.getAll();
      setAddresses(response?.addresses || []);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const addAddress = useCallback(async (addressData: Omit<UserAddress, 'id'>) => {
    try {
      if (!api.addressesApi || typeof api.addressesApi.create !== 'function') {
        console.warn('addressesApi.create is not available');
        toast.error('Addresses API not available');
        throw new Error('Addresses API not available');
      }

      const response = await api.addressesApi.create({
        label: addressData.label || 'Home',
        recipientName: addressData.recipientName,
        phone: addressData.phone,
        street: addressData.street,
        city: addressData.city,
        region: addressData.region,
        country: addressData.country || 'Ghana',
        postalCode: addressData.postalCode,
      });

      const newAddress = response.address;
      setAddresses(prev => [...prev, newAddress]);
      toast.success('Address added successfully');
      return newAddress;
    } catch (error) {
      console.error('Failed to add address:', error);
      toast.error('Failed to add address');
      throw error;
    }
  }, []);

  const updateAddress = useCallback(async (id: number, addressData: Partial<UserAddress>) => {
    try {
      if (!api.addressesApi || typeof api.addressesApi.update !== 'function') {
        console.warn('addressesApi.update is not available');
        toast.error('Addresses API not available');
        throw new Error('Addresses API not available');
      }

      const response = await api.addressesApi.update(id, addressData);
      const updatedAddress = response.address;
      
      setAddresses(prev =>
        prev.map(addr => (addr.id === id ? updatedAddress : addr))
      );
      toast.success('Address updated successfully');
      return updatedAddress;
    } catch (error) {
      console.error('Failed to update address:', error);
      toast.error('Failed to update address');
      throw error;
    }
  }, []);

  const deleteAddress = useCallback(async (id: number) => {
    try {
      if (!api.addressesApi || typeof api.addressesApi.delete !== 'function') {
        console.warn('addressesApi.delete is not available');
        toast.error('Addresses API not available');
        throw new Error('Addresses API not available');
      }

      await api.addressesApi.delete(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
      throw error;
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: number) => {
    try {
      if (!api.addressesApi || typeof api.addressesApi.setDefault !== 'function') {
        console.warn('addressesApi.setDefault is not available');
        toast.error('Addresses API not available');
        throw new Error('Addresses API not available');
      }

      await api.addressesApi.setDefault(id);
      
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      toast.success('Default address updated');
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('Failed to set default address');
      throw error;
    }
  }, []);

  const defaultAddress = addresses.find(addr => addr.isDefault) || null;

  const value: AddressContextType = {
    addresses,
    defaultAddress,
    loading,
    refreshAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
}
