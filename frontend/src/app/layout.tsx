import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/providers';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { NavigationProgressWrapper } from '@/components/shared/navigation-progress-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ShopHub - Your One-Stop Shopping Destination',
    template: '%s | ShopHub',
  },
  description: 'Discover amazing products at affordable prices. Shop electronics, fashion, home goods, and more.',
  keywords: ['ecommerce', 'shopping', 'online store', 'electronics', 'fashion'],
  authors: [{ name: 'ShopHub' }],
  creator: 'ShopHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shophub.com',
    siteName: 'ShopHub',
    title: 'ShopHub - Your One-Stop Shopping Destination',
    description: 'Discover amazing products at affordable prices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopHub',
    description: 'Discover amazing products at affordable prices.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global navigation progress bar — renders above everything, zero layout impact */}
        <NavigationProgressWrapper />
        <ErrorBoundary>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
