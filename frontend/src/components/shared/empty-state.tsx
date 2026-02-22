'use client';

import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon = <Search className="w-12 h-12" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
