'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppDownloadLink, AppPlatform } from '@/types';
import { publicApi, adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

interface AppDownloadLinksContextType {
  appDownloadLinks: AppDownloadLink[];
  loading: boolean;
  error: string | null;
  getLinkByPlatform: (platform: AppPlatform) => AppDownloadLink | null;
  refreshAppDownloadLinks: () => Promise<void>;
  updateAppDownloadLink: (platform: AppPlatform, url: string | null, isActive: boolean) => Promise<AppDownloadLink>;
}

const AppDownloadLinksContext = createContext<AppDownloadLinksContextType | undefined>(undefined);

// Initialize default app download links with null URLs
const DEFAULT_APP_PLATFORMS: AppDownloadLink[] = [
  { id: 1, platform: AppPlatform.APPLE_APP_STORE, url: null, isActive: true },
  { id: 2, platform: AppPlatform.GOOGLE_PLAY_STORE, url: null, isActive: true },
];

export function AppDownloadLinksProvider({ children }: { children: ReactNode }) {
  const [appDownloadLinks, setAppDownloadLinks] = useState<AppDownloadLink[]>(DEFAULT_APP_PLATFORMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load app download links on mount (public endpoint)
  useEffect(() => {
    const loadAppDownloadLinks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicApi.getAppDownloadLinks();
        const links = response.appDownloadLinks || [];
        
        // Merge with defaults to ensure all platforms are always present
        const mergedLinks = DEFAULT_APP_PLATFORMS.map(defaultLink => {
          const existingLink = links.find((l: any) => l.platform === defaultLink.platform);
          return existingLink || defaultLink;
        });
        
        setAppDownloadLinks(mergedLinks);
      } catch (err) {
        console.error('Failed to load app download links:', err);
        setError('Failed to load app download links');
        setAppDownloadLinks(DEFAULT_APP_PLATFORMS);
      } finally {
        setLoading(false);
      }
    };

    loadAppDownloadLinks();
  }, []);

  const refreshAppDownloadLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await publicApi.getAppDownloadLinks();
      const links = response.appDownloadLinks || [];
      
      const mergedLinks = DEFAULT_APP_PLATFORMS.map(defaultLink => {
        const existingLink = links.find((l: any) => l.platform === defaultLink.platform);
        return existingLink || defaultLink;
      });
      
      setAppDownloadLinks(mergedLinks);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh app download links:', err);
      setError('Failed to refresh app download links');
    } finally {
      setLoading(false);
    }
  }, []);

  const getLinkByPlatform = useCallback(
    (platform: AppPlatform): AppDownloadLink | null => {
      return appDownloadLinks.find(link => link.platform === platform) || null;
    },
    [appDownloadLinks]
  );

  const updateAppDownloadLink = useCallback(
    async (platform: AppPlatform, url: string | null, isActive: boolean): Promise<AppDownloadLink> => {
      try {
        const response = await adminApi.updateAppDownloadLink(platform, { url, isActive });
        const updatedLink = response.appDownloadLink;
        
        setAppDownloadLinks(prev =>
          prev.map(link => (link.platform === platform ? updatedLink : link))
        );
        
        toast.success(`${platform} link updated successfully`);
        return updatedLink;
      } catch (err) {
        console.error('Failed to update app download link:', err);
        toast.error('Failed to update app download link');
        throw err;
      }
    },
    []
  );

  const value: AppDownloadLinksContextType = {
    appDownloadLinks,
    loading,
    error,
    getLinkByPlatform,
    refreshAppDownloadLinks,
    updateAppDownloadLink,
  };

  return (
    <AppDownloadLinksContext.Provider value={value}>
      {children}
    </AppDownloadLinksContext.Provider>
  );
}

export function useAppDownloadLinks() {
  const context = useContext(AppDownloadLinksContext);
  if (!context) {
    throw new Error('useAppDownloadLinks must be used within AppDownloadLinksProvider');
  }
  return context;
}
