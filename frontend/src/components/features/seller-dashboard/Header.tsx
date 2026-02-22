"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Menu
} from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

interface HeaderProps {
  seller?: any;
  onMobileMenuToggle?: () => void;
}

export default function Header({ seller, onMobileMenuToggle }: HeaderProps) {
  const { logout } = useSellerAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, title: 'New Order', message: 'Order #12345 has been placed', time: '2 min ago', type: 'order', read: false },
    { id: 2, title: 'Low Stock Alert', message: 'Product "Blue T-Shirt" is running low on stock', time: '1 hour ago', type: 'warning', read: false },
    { id: 3, title: 'Payout Processed', message: 'Your payout of $1,234.56 has been processed', time: '3 hours ago', type: 'success', read: true },
    { id: 4, title: 'Store Update', message: 'Your store verification is under review', time: '1 day ago', type: 'info', read: true },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} className="text-blue-600" />;
      case 'warning': return <Bell size={16} className="text-yellow-600" />;
      case 'success': return <Bell size={16} className="text-green-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                onMobileMenuToggle?.();
              }}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Store Name (Mobile/Tablet) */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-white" size={16} />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {seller?.storeName || 'Seller Hub'}
              </span>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Stats (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-lg font-bold text-gray-900">$456</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-lg font-bold text-blue-600">12</p>
              </div>
            </div>

            {/* Cart */}
            <Link 
              href="/seller/orders" 
              className="relative flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Orders</span>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <Link href="/seller/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {seller?.firstName?.[0]}{seller?.lastName?.[0] || 'S'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {seller?.firstName} {seller?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{seller?.email}</p>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/seller/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      href="/seller/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}