'use client';

import React, { ReactNode } from 'react';

/**
 * Homepage Variations System
 * 
 * This system allows creating multiple homepage templates for different
 * promotions and seasonal campaigns (New Year Sale, Black Friday, etc.)
 */

export type HomepageVariationType = 'default' | 'new-year-sale' | 'black-friday' | 'flash-sale' | 'seasonal' | 'holiday';

interface HomepageSection {
  id: string;
  component: ReactNode;
  order: number;
}

interface HomepageVariationConfig {
  id: HomepageVariationType;
  name: string;
  description: string;
  heroBackgroundClass: string;
  heroGradient: string;
  accentColor: string;
  ctaColor: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const HOMEPAGE_VARIATIONS: Record<HomepageVariationType, HomepageVariationConfig> = {
  default: {
    id: 'default',
    name: 'Standard Homepage',
    description: 'Default homepage layout',
    heroBackgroundClass: 'bg-gradient-to-r from-blue-600 to-purple-600',
    heroGradient: 'from-blue-600 to-purple-600',
    accentColor: 'blue',
    ctaColor: 'bg-blue-600 hover:bg-blue-700',
    isActive: false,
  },
  'new-year-sale': {
    id: 'new-year-sale',
    name: 'New Year Sale',
    description: 'New Year 2026 mega sale homepage',
    heroBackgroundClass: 'bg-gradient-to-r from-red-600 via-yellow-600 to-red-600',
    heroGradient: 'from-red-600 via-yellow-600 to-red-600',
    accentColor: 'red',
    ctaColor: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
    isActive: true,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-31'),
  },
  'black-friday': {
    id: 'black-friday',
    name: 'Black Friday Sale',
    description: 'Black Friday mega sale - Up to 80% OFF',
    heroBackgroundClass: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900',
    heroGradient: 'from-slate-900 via-slate-800 to-slate-900',
    accentColor: 'slate',
    ctaColor: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold',
    isActive: false,
    startDate: new Date('2026-11-25'),
    endDate: new Date('2026-12-02'),
  },
  'flash-sale': {
    id: 'flash-sale',
    name: 'Flash Sale',
    description: 'Limited time flash sale',
    heroBackgroundClass: 'bg-gradient-to-r from-orange-500 to-red-600',
    heroGradient: 'from-orange-500 to-red-600',
    accentColor: 'orange',
    ctaColor: 'bg-orange-600 hover:bg-orange-700',
    isActive: false,
  },
  seasonal: {
    id: 'seasonal',
    name: 'Seasonal Sale',
    description: 'Seasonal promotional homepage',
    heroBackgroundClass: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    heroGradient: 'from-emerald-500 to-teal-600',
    accentColor: 'emerald',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-700',
    isActive: false,
  },
  holiday: {
    id: 'holiday',
    name: 'Holiday Sale',
    description: 'Holiday and special occasion sales',
    heroBackgroundClass: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    heroGradient: 'from-purple-500 to-indigo-600',
    accentColor: 'purple',
    ctaColor: 'bg-purple-600 hover:bg-purple-700',
    isActive: false,
  },
};

interface HomepageTemplateProps {
  variation: HomepageVariationType;
  sections: HomepageSection[];
  children?: ReactNode;
}

/**
 * HomepageTemplate Component
 * Provides consistent styling and structure for homepage variations
 */
export function HomepageTemplate({
  variation = 'default',
  sections,
  children,
}: HomepageTemplateProps) {
  const config = HOMEPAGE_VARIATIONS[variation] || HOMEPAGE_VARIATIONS.default;

  return (
    <div className={`homepage-variant-${variation}`} data-variation={variation}>
      {children}
    </div>
  );
}

/**
 * Get active homepage variation
 * Checks if a specific variation is within its date range
 */
export function getActiveVariation(variations?: HomepageVariationType[]): HomepageVariationType {
  const availableVariations = variations || Object.keys(HOMEPAGE_VARIATIONS) as HomepageVariationType[];
  const now = new Date();

  for (const varId of availableVariations) {
    const config = HOMEPAGE_VARIATIONS[varId];
    if (!config.isActive) continue;

    // Check date range if specified
    if (config.startDate && config.endDate) {
      if (now >= config.startDate && now <= config.endDate) {
        return varId;
      }
    } else if (config.isActive) {
      return varId;
    }
  }

  // If no variation is active, return default as fallback
  return 'default';
}

/**
 * Hook to get homepage variation config
 */
export function useHomepageVariation(variation?: HomepageVariationType) {
  const activeVariation = variation || getActiveVariation();
  return HOMEPAGE_VARIATIONS[activeVariation] || HOMEPAGE_VARIATIONS.default;
}
