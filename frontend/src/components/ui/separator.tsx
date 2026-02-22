import React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className = '',
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      className={`
        bg-gray-200
        ${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}
        ${className}
      `}
      {...props}
    />
  );
}
