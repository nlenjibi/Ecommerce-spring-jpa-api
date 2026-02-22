import React from 'react';

interface SalesChartProps {
  data?: any[];
  isLoading?: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <div className="h-64 bg-white rounded-lg shadow-sm p-4 border">
      <div className="h-full flex items-center justify-center text-gray-500">
        Sales Chart Component (Placeholder)
      </div>
    </div>
  );
};

export default SalesChart;