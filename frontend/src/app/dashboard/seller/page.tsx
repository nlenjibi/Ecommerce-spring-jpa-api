"use client";
import React, { useState } from 'react';
import { Package, Truck, TrendingUp, DollarSign, Star, Settings } from 'lucide-react';
import { SellerAuthProvider, useSellerAuth, withSellerAuth } from '@/context/SellerAuthContext';
import Sidebar from '@/components/features/seller-dashboard/Sidebar';
import Header from '@/components/features/seller-dashboard/Header';
import SellerOverview from '@/components/features/seller-dashboard/SellerOverview';
import { LoadingState } from '@/components/features/customer-dashboard/LoadingStates';

function SellerDashboardContent() {
  const { seller, loading, error } = useSellerAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState 
          type="card" 
          message="Loading your seller dashboard..." 
        />
      </div>
    );
  }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="text-center">
//             <h3 className="text-lg font-semibold text-red-900 mb-2">Authentication Error</h3>
//             <p className="text-red-700">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
//
//   if (!seller) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
//           <div className="text-center">
//             <h3 className="text-lg font-semibold text-blue-900 mb-2">Authentication Required</h3>
//             <p className="text-blue-700">Please log in to access your seller dashboard</p>
//             <button
//               onClick={() => window.location.href = '/seller/login'}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SellerOverview />;
      
      case 'products':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
            <div className="text-center py-8 text-gray-600">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Product management system coming soon</p>
              <p className="text-sm">Add, edit, and manage your products</p>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders</h2>
            <div className="text-center py-8 text-gray-600">
              <Truck className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Order management system coming soon</p>
              <p className="text-sm">Process and track your orders</p>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
            <div className="text-center py-8 text-gray-600">
              <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Analytics dashboard coming soon</p>
              <p className="text-sm">View sales trends and performance metrics</p>
            </div>
          </div>
        );
      
      case 'inventory':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
            <div className="text-center py-8 text-gray-600">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Inventory management coming soon</p>
              <p className="text-sm">Track stock levels and manage inventory</p>
            </div>
          </div>
        );
      
      case 'payouts':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payouts</h2>
            <div className="text-center py-8 text-gray-600">
              <DollarSign className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Payout management coming soon</p>
              <p className="text-sm">Request and track your earnings</p>
            </div>
          </div>
        );
      
      case 'reviews':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            <div className="text-center py-8 text-gray-600">
              <Star className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Review management coming soon</p>
              <p className="text-sm">Respond to customer reviews</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="text-center py-8 text-gray-600">
              <Settings className="mx-auto mb-4 text-gray-400" size={48} />
              <p>Store settings coming soon</p>
              <p className="text-sm">Manage your store profile</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        seller={seller}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      
      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <main className="flex-1 p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <SellerAuthProvider>
      <SellerDashboardContent />
    </SellerAuthProvider>
  );
}