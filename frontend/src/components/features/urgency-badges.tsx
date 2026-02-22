'use client';

import React from 'react';
import { Zap, AlertCircle, TrendingDown } from 'lucide-react';

interface UrgencyBadgeProps {
  type: 'last-day' | 'low-stock' | 'almost-gone' | 'limited' | 'flash-sale';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

/**
 * UrgencyBadge Component
 * Displays urgency signals for deals and low stock items
 * 
 * Types:
 * - last-day: "LAST DAY" badge
 * - low-stock: "LOW STOCK" with icon
 * - almost-gone: "ALMOST GONE!" message
 * - limited: "LIMITED QUANTITY" badge
 * - flash-sale: "FLASH SALE" with fire/zap icon
 */
export function UrgencyBadge({
  type,
  className = '',
  size = 'md',
  animate = true,
}: UrgencyBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseClasses = 'inline-flex items-center gap-1.5 font-bold rounded-full whitespace-nowrap';
  const animationClass = animate ? 'animate-pulse' : '';

  const configs = {
    'last-day': {
      bg: 'bg-red-600 text-white',
      label: 'LAST DAY',
      icon: null,
    },
    'low-stock': {
      bg: 'bg-orange-600 text-white',
      label: 'LOW STOCK',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    'almost-gone': {
      bg: 'bg-red-700 text-white',
      label: 'ALMOST GONE!',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    },
    'limited': {
      bg: 'bg-purple-600 text-white',
      label: 'LIMITED QUANTITY',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    'flash-sale': {
      bg: 'bg-gradient-to-r from-yellow-500 to-red-600 text-white',
      label: 'FLASH SALE',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[type];

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${config.bg} ${animationClass} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

interface StockWarningProps {
  stockCount: number;
  threshold?: number;
  className?: string;
}

/**
 * StockWarning Component
 * Shows "Only N left in stock" message
 */
export function StockWarning({
  stockCount,
  threshold = 5,
  className = '',
}: StockWarningProps) {
  if (stockCount > threshold) return null;

  return (
    <div className={`text-sm font-semibold text-red-600 ${className}`}>
      Only {stockCount} left in stock!
    </div>
  );
}

interface UrgencyMessageProps {
  message: string;
  type?: 'warning' | 'info' | 'success';
  animate?: boolean;
  className?: string;
}

/**
 * UrgencyMessage Component
 * Generic urgency message for promotions
 */
export function UrgencyMessage({
  message,
  type = 'warning',
  animate = true,
  className = '',
}: UrgencyMessageProps) {
  const typeClasses = {
    warning: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div
      className={`text-sm font-medium border-l-4 px-3 py-2 rounded-r ${typeClasses[type]} ${
        animate ? 'animate-pulse' : ''
      } ${className}`}
    >
      {message}
    </div>
  );
}
