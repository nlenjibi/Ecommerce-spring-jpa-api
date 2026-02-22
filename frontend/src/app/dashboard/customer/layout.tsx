import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Manage your orders, profile, and account settings',
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}