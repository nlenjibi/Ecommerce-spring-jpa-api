'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Percent } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { UrgencyBadge } from '../urgency-badges';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../../ui/Button';
import { Product } from '@/types';
import { SkeletonProductCardGrid, SkeletonCategoryCardGrid } from '../../skeletons';

interface BlackFridayHomepageProps {
  dealProducts?: Product[];
  recommendedProducts?: Product[];
  categories?: Array<{ name: string; slug: string; image: string; count?: number }>;
  isLoading?: boolean;
}

/**
 * Black Friday Sale Homepage
 * 
 * Features:
 * - Dark theme with yellow/gold accents
 * - Aggressive "UP TO 80% OFF" messaging
 * - Lightning countdown timer
 * - Deal categories
 * - Best-selling items section
 * - Exclusive deals
 * - Limited quantity warnings
 */
export function BlackFridayHomepage({
  dealProducts = [],
  recommendedProducts = [],
  categories = [],
  isLoading = false,
}: BlackFridayHomepageProps) {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date('2026-12-02T23:59:59');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Default categories if not provided
  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Electronics', slug: 'electronics', image: '📱' },
    { name: 'Fashion', slug: 'fashion', image: '👕' },
    { name: 'Home & Garden', slug: 'home', image: '🏠' },
    { name: 'Sports & Outdoors', slug: 'sports', image: '⚽' },
    { name: 'Beauty & Health', slug: 'beauty', image: '💄' },
    { name: 'Toys & Games', slug: 'toys', image: '🎮' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mega Banner Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-300 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side */}
            <div className="z-10">
              {/* Badge */}
              <div className="mb-4 inline-block">
                <UrgencyBadge type="last-day" size="md" animate={true} />
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 leading-tight text-yellow-300">
                BLACK FRIDAY
              </h1>

              {/* Subheading */}
              <p className="text-3xl sm:text-4xl font-bold mb-6 text-yellow-400">
                UP TO 80% OFF
              </p>

              {/* Description */}
              <p className="text-lg mb-8 text-gray-300 leading-relaxed max-w-md">
                The biggest shopping event of the year! Don't miss out on incredible deals on thousands of products. Quantities are limited!
              </p>

              {/* Countdown */}
              <div className="mb-8 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 p-4 rounded-xl inline-block">
                <p className="text-sm font-semibold mb-3 text-yellow-300">SALE ENDS IN</p>
                <CountdownTimer
                  endDate={saleEndDate}
                  size="lg"
                  format="full"
                  showLabels={true}
                />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products?promotion=black-friday">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold w-full sm:w-auto">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    SHOP NOW
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 w-full sm:w-auto">
                    View All Deals
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-transparent rounded-full opacity-20 blur-2xl" />
                <div className="absolute inset-8 bg-yellow-400/10 rounded-full border-4 border-yellow-400/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-black text-yellow-400 mb-2">80%</div>
                    <div className="text-lg font-bold text-yellow-300">OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950" style={{
          clipPath: 'polygon(0 50%, 5% 45%, 10% 50%, 15% 45%, 20% 50%, 25% 45%, 30% 50%, 35% 45%, 40% 50%, 45% 45%, 50% 50%, 55% 45%, 60% 50%, 65% 45%, 70% 50%, 75% 45%, 80% 50%, 85% 45%, 90% 50%, 95% 45%, 100% 50%, 100% 100%, 0 100%)',
        }} />
      </section>

      {/* Deal Categories */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Deal Categories</h2>
          <p className="text-gray-400">Deep discounts in every category</p>
        </div>

        {isLoading ? (
          <SkeletonCategoryCardGrid count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {defaultCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/categories/${cat.slug}?promotion=black-friday`}
                className="group"
              >
                <div className="relative bg-slate-800 hover:bg-slate-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 text-center hover:-translate-y-1 border border-slate-700">
                  {/* Circular background */}
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">{cat.image}</span>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-gray-100 text-sm line-clamp-2">
                    {cat.name}
                  </h3>

                  {/* Badge */}
                  <div className="mt-2 text-xs font-bold text-yellow-400">
                    Save Big
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers Section */}
      {dealProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Best Sellers</h2>
            </div>
            <p className="text-gray-400 ml-11">Most popular deals right now</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={5} />
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-4 md:gap-6 min-w-min md:min-w-full md:grid md:grid-cols-5">
                {dealProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-48 md:w-auto md:flex-shrink">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Exclusive Deals */}
      {recommendedProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Exclusive Deals</h2>
            </div>
            <p className="text-gray-400 ml-11">Limited quantities - Grab them before they're gone!</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={5} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trust Section */}
      <section className="bg-slate-800 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Black Friday Guarantee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '✓', title: 'Best Prices', desc: 'Guaranteed lowest prices on all items' },
              { icon: '🚀', title: 'Fast Shipping', desc: 'Quick delivery even during peak season' },
              { icon: '🛡️', title: 'Secure', desc: 'Safe checkout and buyer protection' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day returns on most items' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Don't Miss Out!
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Stock is limited and selling fast. Shop your favorite categories before items run out.
          </p>
          <Link href="/products?promotion=black-friday">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
