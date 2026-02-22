import { Suspense as ReactSuspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function SuspenseWrapper({
  children,
  fallback,
  className,
}: SuspenseWrapperProps) {
  const defaultFallback = (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
  );

  return (
    <ReactSuspense fallback={fallback || defaultFallback}>
      {children}
    </ReactSuspense>
  );
}

// Product Card Suspense
export function ProductCardSuspense({ children }: { children: React.ReactNode }) {
  return (
    <SuspenseWrapper
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}

// List Suspense
export function ListSuspense({ 
  children, 
  count = 5 
}: { 
  children: React.ReactNode; 
  count?: number; 
}) {
  return (
    <SuspenseWrapper
      fallback={
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}

export default SuspenseWrapper;
