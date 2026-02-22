"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  User, 
  Shield, 
  Heart, 
  MapPin, 
  HeadphonesIcon,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: any;
}

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'profile', label: 'Account Details', icon: User },
  { id: 'security', label: 'Password & Security', icon: Shield },
  { id: 'wishlist', label: 'Saved Items', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'support', label: 'Support Center', icon: HeadphonesIcon },
];

export default function Sidebar({ isCollapsed, onToggle, activeTab, onTabChange, user }: SidebarProps) {
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
        w-64
        bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900">My Account</h2>
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
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />

                {/* Label always visible */}
                <span className="ml-3 text-sm font-medium text-gray-800">
                  {item.label}
                </span>

          {/* No per-item avatar initials to avoid showing TN in menu items */}
              </button>
            );
          })}
        </nav>

        {/* User Info (only show avatar; remove name/email) */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
              {user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}
            </div>
          )}
          
          {!isCollapsed && (
            <button className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}