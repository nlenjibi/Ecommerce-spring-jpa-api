import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Home, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center space-y-8">
        {/* Animated 404 Graphic */}
        <div className="relative">
          <div className="text-9xl font-bold text-gray-300 opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="h-24 w-24 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Page Not Found
              </h1>
            </div>
          </div>
        </div>

        <Card className="max-w-md mx-auto shadow-lg border-0">
          <CardHeader className="space-y-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Oops! Lost in the digital shelves?
            </CardTitle>
            <CardDescription className="text-gray-600">
              The page you&apos;re looking for seems to have been misplaced or doesn&apos;t exist.
              Let&apos;s get you back to shopping!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/shop/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Browse Products
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/shop/search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Products
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Think this is a mistake?
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/marketing/contact"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Contact Support
                </Link>
                <Link
                  href="/marketing/help"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Get Help
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 text-sm mb-3">Popular pages you might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: '/shop/deals', label: 'Deals & Offers' },
              { href: '/shop/new-arrivals', label: 'New Arrivals' },
              { href: '/shop/categories', label: 'Categories' },
              { href: '/marketing/about', label: 'About Us' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional: Generate metadata for the 404 page
export const metadata = {
  title: 'Page Not Found - 404 Error',
  description: 'The page you are looking for does not exist. Return to the homepage or browse our products.',
  robots: {
    index: false,
    follow: false,
  },
};
