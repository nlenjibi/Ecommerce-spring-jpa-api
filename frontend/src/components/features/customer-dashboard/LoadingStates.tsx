"use client";
import React from 'react';
import { RefreshCw, AlertTriangle, Package } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'card';
  message?: string;
  className?: string;
}

export function LoadingState({ type = 'spinner', message = 'Loading...', className = '' }: LoadingStateProps) {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/6"></div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <RefreshCw className="text-blue-600 animate-spin" size={32} />
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-30"></div>
          </div>
          <p className="text-gray-600 text-center">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <RefreshCw className="text-blue-600 animate-spin" size={20} />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className = '' }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      <div className="text-center space-y-4">
        <AlertTriangle className="text-red-500 mx-auto" size={48} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 text-sm">{errorMessage}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      <div className="text-center space-y-4">
        {icon || <Package className="text-gray-400 mx-auto" size={48} />}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}