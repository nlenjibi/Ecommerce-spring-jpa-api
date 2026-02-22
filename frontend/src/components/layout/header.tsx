'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, items } = useCart();
  const { wishlist, itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/shop/products' },
    { name: 'Categories', href: '/shop/categories' },
    { name: 'Deals', href: '/shop/deals' },
    { name: 'About', href: '/marketing/about' },
  ];

  const isActive = (href: string) => pathname === href;

  const renderUserMenuItems = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <Link href="/dashboard/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Admin Dashboard
          </Link>
          <Link href="/dashboard/admin/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Manage Products
          </Link>
          <Link href="/dashboard/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Users
          </Link>
        </>
      );
    }

    if (user?.role === 'seller') {
      return (
        <>
          <Link href="/dashboard/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Seller Dashboard
          </Link>
          <Link href="/dashboard/seller/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            My Products
          </Link>
          <Link href="/dashboard/seller/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Orders
          </Link>
        </>
      );
    }

    // Default customer menu
    return (
      <>
        <Link href="/dashboard/customer?tab=profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Profile
        </Link>
        
        <Link href="/dashboard/customer?tab=orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Orders
        </Link>
        <Link href="/dashboard/customer?tab=wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Wishlist
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/shop/search" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </Link>
            
            <Link href="/shop/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Heart className="w-5 h-5 text-gray-600" />
              {(wishlistCount > 0 || (wishlist && wishlist.length > 0)) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount || wishlist?.length || 0}
                </span>
              )}
            </Link>

            <Link href="/shop/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
        {isAuthenticated ? (
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{user?.firstName || user?.lastName || 'User'}</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {renderUserMenuItems()}

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
  </div>
) : (
  <Link href="/auth/login">
    <Button size="sm">Login</Button>
  </Link>
)}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2">
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </SheetTrigger>
            
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium transition-colors ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link href="/shop/cart" className="flex items-center space-x-2 text-gray-700">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart ({items.length})</span>
                  </Link>
                  
                  <Link href="/shop/wishlist" className="flex items-center space-x-2 text-gray-700">
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard/customer?tab=profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link href="/dashboard/customer?tab=wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Wishlist
                      </Link>
                      <button onClick={logout} className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full">Login</Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
