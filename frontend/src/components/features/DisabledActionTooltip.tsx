'use client';

import React, { ReactNode } from 'react';

interface DisabledActionTooltipProps {
  disabled: boolean;
  message?: string;
  children: ReactNode;
}

export function DisabledActionTooltip({
  disabled,
  message = 'Out of stock',
  children,
}: DisabledActionTooltipProps) {
  if (!disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative group cursor-not-allowed">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {message}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}
