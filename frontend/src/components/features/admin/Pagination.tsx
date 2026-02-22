import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number; // 0-based page number
  totalPages: number;
  onPageChange: (page: number) => void;
  totalElements?: number;
  size?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  page, 
  totalPages, 
  onPageChange, 
  totalElements,
  size,
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  // Display page is 1-based for user display
  const displayPage = page + 1;
  
  // Calculate showing range
  const start = totalElements ? page * (size || 10) + 1 : null;
  const end = totalElements ? Math.min((page + 1) * (size || 10), totalElements) : null;

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-gray-200 ${className}`}>
      <p className="text-sm text-gray-600">
        {totalElements && start && end 
          ? `Showing ${start}-${end} of ${totalElements} items`
          : `Page ${displayPage} of ${totalPages}`
        }
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
