import React from 'react';

interface ReportProps {
  title: string;
  isLoading?: boolean;
}

const SalesReport: React.FC<ReportProps> = ({ title, isLoading }) => {
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Generating Report...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex items-center justify-center h-64 text-gray-500">
        Sales Report Component (Placeholder)
      </div>
    </div>
  );
};

export default SalesReport;