'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { SocialLink, SocialPlatform } from '@/types';
import { publicApi, adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

interface SocialLinksContextType {
  socialLinks: SocialLink[];
  loading: boolean;
  error: string | null;
  getLinkByPlatform: (platform: SocialPlatform) => SocialLink | null;
  refreshSocialLinks: () => Promise<void>;
  updateSocialLink: (platform: SocialPlatform, url: string | null, isActive: boolean) => Promise<SocialLink>;
}

const SocialLinksContext = createContext<SocialLinksContextType | undefined>(undefined);

// Initialize default social platforms with null URLs
const DEFAULT_SOCIAL_PLATFORMS: SocialLink[] = [
  { id: 1, platform: SocialPlatform.X, url: null, isActive: true },
  { id: 2, platform: SocialPlatform.FACEBOOK, url: null, isActive: true },
  { id: 3, platform: SocialPlatform.INSTAGRAM, url: null, isActive: true },
  { id: 4, platform: SocialPlatform.TELEGRAM, url: null, isActive: true },
  { id: 5, platform: SocialPlatform.TIKTOK, url: null, isActive: true },
  { id: 6, platform: SocialPlatform.YOUTUBE, url: null, isActive: true },
  { id: 7, platform: SocialPlatform.WHATSAPP, url: null, isActive: true },
];

export function SocialLinksProvider({ children }: { children: ReactNode }) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_PLATFORMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load social links on mount (public endpoint)
  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicApi.getSocialLinks();
        const links = response.socialLinks || [];
        
        // Merge with defaults to ensure all platforms are always present
        const mergedLinks = DEFAULT_SOCIAL_PLATFORMS.map(defaultLink => {
          const existingLink = links.find((l: any) => l.platform === defaultLink.platform);
          return existingLink || defaultLink;
        });
        
        setSocialLinks(mergedLinks);
      } catch (err) {
        console.error('Failed to load social links:', err);
        setError('Failed to load social links');
        setSocialLinks(DEFAULT_SOCIAL_PLATFORMS);
      } finally {
        setLoading(false);
      }
    };

    loadSocialLinks();
  }, []);

  const refreshSocialLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await publicApi.getSocialLinks();
      const links = response.socialLinks || [];
      
      const mergedLinks = DEFAULT_SOCIAL_PLATFORMS.map(defaultLink => {
        const existingLink = links.find((l: any) => l.platform === defaultLink.platform);
        return existingLink || defaultLink;
      });
      
      setSocialLinks(mergedLinks);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh social links:', err);
      setError('Failed to refresh social links');
    } finally {
      setLoading(false);
    }
  }, []);

  const getLinkByPlatform = useCallback(
    (platform: SocialPlatform): SocialLink | null => {
      return socialLinks.find(link => link.platform === platform) || null;
    },
    [socialLinks]
  );

  const updateSocialLink = useCallback(
    async (platform: SocialPlatform, url: string | null, isActive: boolean): Promise<SocialLink> => {
      try {
        const response = await adminApi.updateSocialLink(platform, { url, isActive });
        const updatedLink = response.socialLink;
        
        setSocialLinks(prev =>
          prev.map(link => (link.platform === platform ? updatedLink : link))
        );
        
        toast.success(`${platform} link updated successfully`);
        return updatedLink;
      } catch (err) {
        console.error('Failed to update social link:', err);
        toast.error('Failed to update social link');
        throw err;
      }
    },
    []
  );

  const value: SocialLinksContextType = {
    socialLinks,
    loading,
    error,
    getLinkByPlatform,
    refreshSocialLinks,
    updateSocialLink,
  };

  return (
    <SocialLinksContext.Provider value={value}>
      {children}
    </SocialLinksContext.Provider>
  );
}

export function useSocialLinks() {
  const context = useContext(SocialLinksContext);
  if (!context) {
    throw new Error('useSocialLinks must be used within SocialLinksProvider');
  }
  return context;
}

// ============ LIVE SUPPORT CONTEXT ============
import { HelpLink, ChatConfig } from '@/types';

interface LiveSupportContextType {
  helpLinks: HelpLink[];
  chatConfigs: ChatConfig[];
  floatingButtonEnabled: boolean;
  floatingButtonPosition: 'bottom-left' | 'bottom-right';
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

export const LiveSupportContext = createContext<LiveSupportContextType | undefined>(undefined);

export function LiveSupportProvider({ children }: { children: ReactNode }) {
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>([]);
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([]);
  const [floatingButtonEnabled, setFloatingButtonEnabled] = useState(true);
  const [floatingButtonPosition, setFloatingButtonPosition] = useState<'bottom-left' | 'bottom-right'>('bottom-right');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicApi.getHelpSupportSettings();
      setHelpLinks(response.helpLinks || []);
      setChatConfigs(response.chatConfigs || []);
      setFloatingButtonEnabled(response.floatingButtonEnabled ?? true);
      setFloatingButtonPosition(response.floatingButtonPosition ?? 'bottom-right');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load help & support settings';
      setError(errorMessage);
      console.error('Error loading help & support:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <LiveSupportContext.Provider
      value={{
        helpLinks,
        chatConfigs,
        floatingButtonEnabled,
        floatingButtonPosition,
        loading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </LiveSupportContext.Provider>
  );
}

export function useLiveSupport() {
  const context = useContext(LiveSupportContext);
  if (!context) {
    throw new Error('useLiveSupport must be used within LiveSupportProvider');
  }
  return context;
}
