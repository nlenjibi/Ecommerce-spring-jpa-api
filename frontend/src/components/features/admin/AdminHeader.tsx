import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function AdminHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-gray-900 text-white shadow-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-8 py-4">
        <Link href="/admin" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          ShopHub Admin
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Admin'}
          </span>
          {user && (
            <button
              onClick={logout}
              className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-white text-sm font-semibold"
            >
              Logout
            </button>
          )}
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-200 font-medium ml-4">
            ← Back to Store
          </Link>
        </div>
      </div>
    </header>
  );
}
