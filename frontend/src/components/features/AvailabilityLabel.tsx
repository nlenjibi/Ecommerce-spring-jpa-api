'use client';

import React from 'react';
import { AvailabilityType } from '@/types';
import { Store, Truck } from 'lucide-react';

interface AvailabilityLabelProps {
  type?: AvailabilityType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvailabilityLabel({
  type = AvailabilityType.SHIPPED,
  showIcon = true,
  size = 'md',
  className = '',
}: AvailabilityLabelProps) {
  const isInStore = type === AvailabilityType.IN_STORE;
  const Icon = isInStore ? Store : Truck;

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textClasses = isInStore ? 'text-amber-700' : 'text-blue-700';

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${textClasses} ${className}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="font-medium">
        {isInStore ? 'In Store' : 'Shipped'}
      </span>
    </div>
  );
}
