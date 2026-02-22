'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  const context = useContext(SheetContext);
  if (!context) throw new Error('SheetTrigger must be used within Sheet');

  const handleClick = () => context.setOpen(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return <button onClick={handleClick}>{children}</button>;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export function SheetContent({ children, side = 'right', className = '' }: SheetContentProps) {
  const context = useContext(SheetContext);
  if (!context) throw new Error('SheetContent must be used within Sheet');

  if (!context.open) return null;

  const sideClasses = {
    left: 'left-0 top-0 h-full w-80 animate-slide-in-left',
    right: 'right-0 top-0 h-full w-80 animate-slide-in-right',
    top: 'top-0 left-0 w-full h-80 animate-slide-in-top',
    bottom: 'bottom-0 left-0 w-full h-80 animate-slide-in-bottom',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={() => context.setOpen(false)}
      />
      
      {/* Sheet */}
      <div className={`fixed bg-white shadow-lg ${sideClasses[side]} ${className}`}>
        <button
          onClick={() => context.setOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetHeader({ children, className = '' }: SheetHeaderProps) {
  return <div className={`p-6 pb-4 ${className}`}>{children}</div>;
}

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetTitle({ children, className = '' }: SheetTitleProps) {
  return <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h2>;
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetDescription({ children, className = '' }: SheetDescriptionProps) {
  return <p className={`text-sm text-gray-600 mt-2 ${className}`}>{children}</p>;
}
