import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Dashboard - Manage Your Store',
  description: 'Comprehensive seller dashboard for managing products, orders, analytics, and store settings',
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}