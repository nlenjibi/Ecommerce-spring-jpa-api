'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Flame } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { UrgencyBadge } from '../urgency-badges';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../../ui/Button';
import { Product } from '@/types';
import { SkeletonProductCardGrid, SkeletonCategoryCardGrid } from '../../skeletons';

interface NewYearSaleHomepageProps {
  flashDealProducts?: Product[];
  recommendedProducts?: Product[];
  categories?: Array<{ name: string; slug: string; image: string; count?: number }>;
  isLoading?: boolean;
}

/**
 * New Year Sale Homepage
 * 
 * Features:
 * - Animated mega sale banner with countdown timer
 * - "UP TO 90% OFF" headline
 * - Category grid with circular icons
 * - Flash deals with countdown timers
 * - Featured products sections
 * - Urgency badges and signals
 * - Mobile-first responsive design
 */
export function NewYearSaleHomepage({
  flashDealProducts = [],
  recommendedProducts = [],
  categories = [],
  isLoading = false,
}: NewYearSaleHomepageProps) {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date('2026-01-31T23:59:59');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Default categories if not provided
  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Beauty & Health', slug: 'beauty', image: '💄' },
    { name: 'Women\'s Clothing', slug: 'womens-clothing', image: '👗' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', image: '🏠' },
    { name: 'Men\'s Clothing', slug: 'mens-clothing', image: '👔' },
    { name: 'Women\'s Shoes', slug: 'womens-shoes', image: '👠' },
    { name: 'Men\'s Underwear', slug: 'mens-underwear', image: '👕' },
    { name: 'Sports & Outdoors', slug: 'sports', image: '⚽' },
    { name: 'Office & School', slug: 'office', image: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mega Banner Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-300 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side */}
            <div className="z-10">
              {/* Badge */}
              <div className="mb-4 inline-block">
                <UrgencyBadge type="flash-sale" size="md" animate={true} />
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                NEW YEAR SALE
              </h1>

              {/* Subheading */}
              <p className="text-2xl sm:text-3xl font-bold mb-6 text-yellow-200">
                UP TO 90% OFF
              </p>

              {/* Description */}
              <p className="text-lg mb-8 text-red-100 leading-relaxed max-w-md">
                Celebrate 2026 with the biggest sales of the year! Discover thousands of products at unbeatable prices. Free shipping on orders over GHS 500.
              </p>

              {/* Countdown */}
              <div className="mb-8 bg-black/20 backdrop-blur-sm p-4 rounded-xl inline-block">
                <p className="text-sm font-semibold mb-3 text-yellow-200">OFFER ENDS IN</p>
                <CountdownTimer
                  endDate={saleEndDate}
                  size="lg"
                  format="full"
                  showLabels={true}
                />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products?promotion=flash-sale">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold w-full sm:w-auto">
                    <Zap className="w-5 h-5 mr-2" />
                    SHOP NOW
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    View All Deals
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-transparent rounded-full opacity-30 blur-2xl" />
                <div className="absolute inset-8 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="text-7xl font-black text-yellow-200">90%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{
          clipPath: 'polygon(0 50%, 5% 45%, 10% 50%, 15% 45%, 20% 50%, 25% 45%, 30% 50%, 35% 45%, 40% 50%, 45% 45%, 50% 50%, 55% 45%, 60% 50%, 65% 45%, 70% 50%, 75% 45%, 80% 50%, 85% 45%, 90% 50%, 95% 45%, 100% 50%, 100% 100%, 0 100%)',
        }} />
      </section>

      {/* Categories Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>

        {isLoading ? (
          <SkeletonCategoryCardGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {defaultCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/categories/${cat.slug}`}
                className="group"
              >
                <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center hover:-translate-y-1">
                  {/* Circular background */}
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <span className="text-4xl">{typeof cat.image === 'string' && cat.image.length === 1 ? cat.image : '🛍️'}</span>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {cat.name}
                  </h3>

                  {/* Item count */}
                  {cat.count && (
                    <p className="text-xs text-gray-500">{cat.count} items</p>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Flash Deals Section */}
      {flashDealProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-900">Lightning Deals</h2>
            </div>
            <p className="text-gray-600 ml-11">Limited quantities - Shop before they're gone!</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={5} />
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-4 md:gap-6 min-w-min md:min-w-full md:grid md:grid-cols-5">
                {flashDealProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-48 md:w-auto md:flex-shrink">
                    <div className="relative">
                      <ProductCard product={product} />
                      {/* Flash Deal Timer */}
                      <div className="absolute bottom-16 left-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg text-center">
                        <CountdownTimer
                          endDate={saleEndDate}
                          size="sm"
                          format="inline"
                          showLabels={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Featured Products */}
      {recommendedProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended for You</h2>
            <p className="text-gray-600">Popular items on sale this week</p>
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
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Shop with Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '✓', title: 'Trusted by Millions', desc: 'Shop with confidence on Africa\'s leading platform' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Get items delivered in 2-7 days to most areas' },
              { icon: '🛡️', title: 'Secure Payments', desc: 'Multiple payment methods with buyer protection' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy on most items' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
