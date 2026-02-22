'use client';

import React from 'react';
import { Truck, MapPin, Zap, Globe, TrendingUp, Star, Zap as BoltIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { FulfillmentType, StockStatus } from '@/types';

interface FulfillmentBadgeProps {
  type: FulfillmentType;
  size?: 'sm' | 'md';
}

const fulfillmentConfig = {
  [FulfillmentType.SHIPPED]: {
    icon: <Truck className="w-3 h-3" />,
    label: 'Shipped',
    color: 'bg-blue-50 text-blue-700',
  },
  [FulfillmentType.IN_STORE_PICKUP]: {
    icon: <MapPin className="w-3 h-3" />,
    label: 'In-Store',
    color: 'bg-green-50 text-green-700',
  },
  [FulfillmentType.EXPRESS_DELIVERY]: {
    icon: <Zap className="w-3 h-3" />,
    label: 'Express',
    color: 'bg-orange-50 text-orange-700',
  },
  [FulfillmentType.INTERNATIONAL_SHIPPING]: {
    icon: <Globe className="w-3 h-3" />,
    label: 'International',
    color: 'bg-purple-50 text-purple-700',
  },
};

export function FulfillmentBadge({ type, size = 'sm' }: FulfillmentBadgeProps) {
  const config = fulfillmentConfig[type];

  return (
    <div
      className={`
        ${config.color}
        inline-flex items-center gap-1
        ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        rounded-full font-medium
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

interface PromotionBadgeProps {
  discountPercentage: number;
  isFlashSale?: boolean;
  isFreeShipping?: boolean;
}

export function PromotionBadge({
  discountPercentage,
  isFlashSale,
  isFreeShipping,
}: PromotionBadgeProps) {
  if (isFlashSale) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        <BoltIcon className="w-3 h-3" />
        Flash Sale
      </div>
    );
  }

  if (discountPercentage > 0) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        -{discountPercentage}%
      </div>
    );
  }

  if (isFreeShipping) {
    return (
      <div className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        <Truck className="w-3 h-3" />
        Free Ship
      </div>
    );
  }

  return null;
}

interface CustomerSignalBadgeProps {
  isTrending?: boolean;
  isMostPurchased?: boolean;
  isRecommended?: boolean;
  rating?: number;
}

export function CustomerSignalBadge({
  isTrending,
  isMostPurchased,
  isRecommended,
  rating,
}: CustomerSignalBadgeProps) {
  if (isTrending) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
        <TrendingUp className="w-3 h-3" />
        Trending
      </div>
    );
  }

  if (isMostPurchased) {
    return (
      <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
        <BoltIcon className="w-3 h-3" />
        Best Seller
      </div>
    );
  }

  if (isRecommended) {
    return (
      <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
        <Star className="w-3 h-3" />
        For You
      </div>
    );
  }

  if (rating && rating >= 4) {
    return (
      <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
        <Star className="w-3 h-3" />
        Top Rated
      </div>
    );
  }

  return null;
}

interface StockBadgeProps {
  status: StockStatus;
  size?: 'sm' | 'md';
}

const stockConfig = {
  [StockStatus.IN_STOCK]: {
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'In Stock',
    color: 'bg-green-50 text-green-700',
  },
  [StockStatus.OUT_OF_STOCK]: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Out of Stock',
    color: 'bg-red-50 text-red-700',
  },
  [StockStatus.LOW_STOCK]: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Low Stock',
    color: 'bg-yellow-50 text-yellow-700',
  },
};

export function StockBadge({ status, size = 'sm' }: StockBadgeProps) {
  const config = stockConfig[status];

  if (!config) return null;

  return (
    <div
      className={`
        ${config.color}
        inline-flex items-center gap-1
        ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        rounded-full font-medium
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
