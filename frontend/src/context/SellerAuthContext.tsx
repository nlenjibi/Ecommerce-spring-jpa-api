"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface SellerUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'seller';
  sellerId?: number;
  sellerType?: 'OFFICIAL' | 'VERIFIED' | 'THIRD_PARTY';
  storeName?: string;
  storeLogo?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  isVerified?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SellerAuthContextType {
  seller: SellerUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSeller: (userData: Partial<SellerUser>) => Promise<void>;
  refreshSeller: () => Promise<void>;
  isVerifiedSeller: () => boolean;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

interface SellerAuthProviderProps {
  children: ReactNode;
}

export function SellerAuthProvider({ children }: SellerAuthProviderProps) {
  const [seller, setSeller] = useState<SellerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSellerAuthStatus();
  }, []);

  const checkSellerAuthStatus = async () => {
    try {
      const token = localStorage.getItem('sellerAccessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to get seller profile with existing token
      const response = await authApi.getProfile((JSON.parse(localStorage.getItem('user') || 'null') as any)?.id);
      const profile = (response as any)?.data || (response as any)?.user || response;
      if ((profile as any)?.role === 'seller') {
        setSeller({ ...(profile as any), sellerId: (profile as any).id });
      } else {
        // Clear tokens if not a seller
        localStorage.removeItem('sellerAccessToken');
        localStorage.removeItem('sellerRefreshToken');
      }
    } catch (err) {
      console.warn('Seller auth check failed:', err);
      // Clear invalid tokens
      localStorage.removeItem('sellerAccessToken');
      localStorage.removeItem('sellerRefreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate seller login - replace with actual API
      const response = await authApi.login(email, password);
      const user = (response as any)?.data || (response as any)?.user || response;
      const sessionToken = (response as any)?.data?.sessionToken || (response as any)?.sessionToken || null;

      if ((user as any)?.role !== 'seller') {
        throw new Error('This account is not registered as a seller');
      }
      
      // Store seller token if available
      if (sessionToken) {
        localStorage.setItem('sellerAccessToken', sessionToken);
      }
      
      // Set seller data
      setSeller({ ...(user as any), sellerId: (user as any).id });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear seller tokens
    localStorage.removeItem('sellerAccessToken');
    localStorage.removeItem('sellerRefreshToken');
    
    // Clear seller data
    setSeller(null);
    setError(null);
    
    // Redirect to seller login
    if (typeof window !== 'undefined') {
      window.location.href = '/seller/login';
    }
  };

  const updateSeller = async (userData: Partial<SellerUser>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.updateProfile(userData, seller?.id);
      const updated = (response as any)?.data || (response as any)?.user || response;
      setSeller({ ...(updated as any), sellerId: (updated as any).id });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSeller = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.getProfile(seller?.id);
      const profile = (response as any)?.data || (response as any)?.user || response;
      if ((profile as any)?.role === 'seller') {
        setSeller({ ...(profile as any), sellerId: (profile as any).id });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to refresh seller data';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const isVerifiedSeller = () => {
    return seller?.role === 'seller' && (seller?.isVerified === true || seller?.sellerType === 'VERIFIED');
  };

  const value: SellerAuthContextType = {
    seller,
    loading,
    error,
    login,
    logout,
    updateSeller,
    refreshSeller,
    isVerifiedSeller,
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
}

// HOC to protect seller routes
export function withSellerAuth<P extends object>(Component: React.ComponentType<P>) {
  return function SellerAuthenticatedComponent(props: P) {
    const { seller, loading } = useSellerAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!seller) {
      if (typeof window !== 'undefined') {
        window.location.href = '/seller/login';
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}
