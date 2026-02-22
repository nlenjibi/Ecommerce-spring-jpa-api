import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Avatar({ className = '', children, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function AvatarImage({ src, alt, className = '', ...props }: AvatarImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AvatarFallback({ children, className = '', ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
