'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FloatingChatButton } from '@/components/features/cart/FloatingChatButton';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/admin');
  const isCustomerRoute = pathname?.startsWith('/customer') || pathname?.startsWith('/dashboard/customer');
  const isSellerRoute = pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard/seller');

  // Admin, customer, and seller routes use their own layout (no global Header/Footer)
  if (isAdminRoute || isCustomerRoute || isSellerRoute) {
    return <>{children}</>;
  }

  // Regular pages use the general Header and Footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
}
