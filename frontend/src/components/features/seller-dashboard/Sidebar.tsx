"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BarChart3, 
  CreditCard, 
  Star, 
  Settings, 
  Menu,
  X,
  Store,
  Users,
  TrendingUp
} from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    href: '/seller',
    badge: null
  },
  { 
    id: 'products', 
    label: 'Products', 
    icon: Package, 
    href: '/seller/products',
    badge: null
  },
  { 
    id: 'orders', 
    label: 'Orders', 
    icon: Truck, 
    href: '/seller/orders',
    badge: 'pending' // Will show pending orders count
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    href: '/seller/analytics',
    badge: null
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: Store, 
    href: '/seller/inventory',
    badge: 'low-stock' // Will show low stock alert
  },
  { 
    id: 'payouts', 
    label: 'Payouts', 
    icon: CreditCard, 
    href: '/seller/payouts',
    badge: null
  },
  { 
    id: 'reviews', 
    label: 'Reviews', 
    icon: Star, 
    href: '/seller/reviews',
    badge: null
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    href: '/seller/settings',
    badge: null
  },
];

export default function Sidebar({ isCollapsed, onToggle, activeTab, onTabChange }: SidebarProps) {
  const { seller } = useSellerAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Store className="text-white" size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Seller Hub</h2>
                {seller?.storeName && (
                  <p className="text-xs text-gray-500 truncate">{seller.storeName}</p>
                )}
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (typeof window !== 'undefined' && window.location.pathname === item.href);
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium flex-1">{item.label}</span>
                )}
                
                {/* Badge for notifications */}
                {item.badge && !isCollapsed && (
                  <div className="flex items-center gap-1">
                    {item.badge === 'pending' && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    )}
                    {item.badge === 'low-stock' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats (Expanded only) */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600 mx-auto mb-1" size={16} />
                <p className="text-xs font-semibold text-green-900">Active</p>
                <p className="text-xs text-green-600">Live</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="text-blue-600 mx-auto mb-1" size={16} />
                <p className="text-xs font-semibold text-blue-900">Verified</p>
                <p className="text-xs text-blue-600">Seller</p>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && seller ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {seller.firstName?.[0]}{seller.lastName?.[0] || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {seller.firstName} {seller.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                {seller.verificationStatus && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full mt-1 ${
                    seller.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Star size={10} className="fill-current" />
                    {seller.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
              {seller?.firstName?.[0]}{seller?.lastName?.[0] || 'S'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}