'use client';

import React, { createContext, useContext, useState } from 'react';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const handleClick = () => context.setOpen(!context.open);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return <button onClick={handleClick}>{children}</button>;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = 'end',
  className = '',
}: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  if (!context.open) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={`
          absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200
          bg-white p-1 shadow-lg
          ${alignClasses[align]}
          ${className}
        `}
      >
        {children}
      </div>
    </>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, className = '' }: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    context?.setOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left px-3 py-2 text-sm rounded-md
        hover:bg-gray-100 transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200" />;
}
