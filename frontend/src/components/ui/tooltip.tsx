'use client';

import React, { createContext, useContext, useState } from 'react';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children, delayDuration = 200 }: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  children: React.ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipTrigger must be used within Tooltip');

  const handleMouseEnter = () => context.setOpen(true);
  const handleMouseLeave = () => context.setOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    });
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  );
}

interface TooltipContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function TooltipContent({ children, side = 'top', className = '' }: TooltipContentProps) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipContent must be used within Tooltip');

  if (!context.open) return null;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div
      className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap ${positions[side]} ${className}`}
    >
      {children}
      <div className={`absolute border-4 border-transparent ${arrows[side]}`} />
    </div>
  );
}
