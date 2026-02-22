"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/features/customer-dashboard/Sidebar';
import Header from '@/components/features/customer-dashboard/Header';
import OverviewCards from '@/components/features/customer-dashboard/OverviewCards';
import OrdersManagement from '@/components/features/customer-dashboard/OrdersManagement';
import OrderDetail from '@/components/features/customer-dashboard/OrderDetail';
import ProfileManagement from '@/components/features/customer-dashboard/ProfileManagement';
import PasswordChange from '@/components/features/customer-dashboard/PasswordChange';
import WishlistSection from '@/components/features/customer-dashboard/WishlistSection';
import Addresses from '@/components/features/customer-dashboard/Addresses';
import NotificationsPanel from '@/components/features/customer-dashboard/NotificationsPanel';
import { LoadingState, ErrorState } from '@/components/features/customer-dashboard/LoadingStates';

function CustomerDashboardContent() {
  const { user, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState type="card" message="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState 
          error={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState 
          error="Please log in to access your dashboard" 
        />
      </div>
    );
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedOrder(null);
  };

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setActiveTab('order-detail');
  };

  const handleOrderCancel = async (orderId: number, reason: string) => {
    // Handle order cancellation logic here
    console.log('Cancelling order:', orderId, 'Reason:', reason);
    // You might want to show a success message and refresh the orders list
    setActiveTab('orders');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <OverviewCards />
            <OrdersManagement onOrderSelect={handleOrderSelect} />
            <NotificationsPanel />
          </div>
        );
      
      case 'orders':
        return (
          <OrdersManagement 
            onOrderSelect={handleOrderSelect}
          />
        );
      
      case 'order-detail':
        return selectedOrder ? (
          <OrderDetail 
            order={selectedOrder}
            onClose={() => setActiveTab('orders')}
            onCancel={handleOrderCancel}
          />
        ) : null;
      
      case 'profile':
        return (
          <ProfileManagement 
            onSave={() => console.log('Profile saved')}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      
      case 'security':
        return (
          <PasswordChange 
            onSave={() => setActiveTab('dashboard')}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      
      case 'wishlist':
        return <WishlistSection />;
      
      case 'addresses':
        return <Addresses />;
      
      case 'support':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Center</h2>
            <p className="text-gray-600">
              Need help? Our support team is here to assist you 24/7.
            </p>
            <div className="mt-6 space-y-4">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Live Chat
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Email Support
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
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

export default function CustomerDashboardPage() {
  return <CustomerDashboardContent />;
}