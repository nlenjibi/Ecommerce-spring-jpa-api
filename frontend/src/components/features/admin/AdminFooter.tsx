import React from 'react';

export function AdminFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs">© {new Date().getFullYear()} ShopHub Admin. All rights reserved.</span>
        <span className="text-xs">Admin Panel • Secure • Internal Use Only</span>
      </div>
    </footer>
  );
}
