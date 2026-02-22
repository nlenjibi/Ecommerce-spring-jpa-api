'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Flame, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { UrgencyBadge } from '../urgency-badges';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../../ui/Button';
import { Product } from '@/types';
import { SkeletonProductCardGrid, SkeletonCategoryCardGrid } from '../../skeletons';

interface FlashSaleHomepageProps {
  readonly flashDealProducts?: Product[];
  readonly recommendedProducts?: Product[];
  readonly categories?: Array<{ name: string; slug: string; image: string; count?: number }>;
  readonly isLoading?: boolean;
}

/**
 * Flash Sale Homepage
 *
 * Features:
 * - Urgent flash sale banner with lightning-fast countdown
 * - "LIMITED TIME" messaging
 * - Lightning deals with stock indicators
 * - Quick add-to-cart functionality
 * - Mobile-optimized horizontal scrolling
 * - Stock countdown warnings
 */
export function FlashSaleHomepage({
  flashDealProducts = [],
  recommendedProducts = [],
  categories = [],
  isLoading = false,
}: Readonly<FlashSaleHomepageProps>) {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Default categories if not provided
  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Electronics', slug: 'electronics', image: '📱' },
    { name: 'Fashion', slug: 'fashion', image: '👕' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', image: '🏠' },
    { name: 'Beauty & Health', slug: 'beauty', image: '💄' },
    { name: 'Sports & Outdoors', slug: 'sports', image: '⚽' },
    { name: 'Books & Media', slug: 'books', image: '📚' },
    { name: 'Toys & Games', slug: 'toys', image: '🎮' },
    { name: 'Automotive', slug: 'automotive', image: '🚗' },
  ];

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Flash Sale Banner Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white h-[5vh]">
        {/* Animated lightning effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-10 h-10 bg-yellow-300 rounded-full blur-2xl animate-ping" />
          <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-white rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-orange-300 rounded-full blur-lg animate-bounce" />
        </div>

        <div className="relative w-full px-1 sm:px-2 lg:px-3 h-full flex items-center justify-center">
          <div className="flex items-center gap-2 text-center">
            {/* Flash Icon */}
            <Zap className="w-3 h-3 text-yellow-300 animate-pulse flex-shrink-0" />
            
            {/* Badge */}
            <UrgencyBadge type="flash-sale" size="xs" animate={true} />
            
            {/* Headline */}
            <h1 className="text-xs sm:text-sm font-black leading-tight">
              FLASH SALE UP TO 70% OFF
            </h1>
            
            {/* Countdown */}
            <div className="bg-black/20 backdrop-blur-sm px-1 py-0.5 rounded inline-block">
              <CountdownTimer
                endDate={saleEndDate}
                size="xs"
                format="inline"
                showLabels={false}
              />
            </div>
            
            {/* CTA */}
            <Link href="/products?promotion=flash-sale">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-[8px] px-1 py-0.5 h-auto">
                SHOP NOW
              </Button>
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-orange-50" style={{
          clipPath: 'polygon(0 50%, 5% 45%, 10% 50%, 15% 45%, 20% 50%, 25% 45%, 30% 50%, 35% 45%, 40% 50%, 45% 45%, 50% 50%, 55% 45%, 60% 50%, 65% 45%, 70% 50%, 75% 45%, 80% 50%, 85% 45%, 90% 50%, 95% 45%, 100% 50%, 100% 100%, 0 100%)',
        }} />
      </section>

      {/* Lightning Deals Section */}
      {flashDealProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Lightning Deals</h2>
            </div>
            <p className="text-gray-600 ml-11">Strike while the iron is hot! These deals won't last long.</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={6} />
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-4 md:gap-6 min-w-min md:min-w-full md:grid md:grid-cols-6">
                {flashDealProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-48 md:w-auto md:flex-shrink">
                    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <ProductCard product={product} />

                      {/* Stock indicator */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Only {Math.floor(Math.random() * 10) + 1} left!
                      </div>

                      {/* Quick countdown */}
                      <div className="absolute bottom-16 left-2 right-2 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg text-center">
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

      {/* Categories Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Find flash deals in your favorite categories</p>
        </div>

        {isLoading ? (
          <SkeletonCategoryCardGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {defaultCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}?promotion=flash-sale`}
                className="group"
              >
                <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center hover:-translate-y-1">
                  {/* Circular background with flash effect */}
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md relative">
                    <span className="text-4xl">{typeof cat.image === 'string' && cat.image.length === 1 ? cat.image : '🛍️'}</span>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-orange-800" />
                    </div>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {cat.name}
                  </h3>

                  {/* Item count */}
                  {!!cat.count && (
                    <p className="text-xs text-gray-500">{cat.count} items on sale</p>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-orange-600/0 group-hover:bg-orange-600/5 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Clearance Deals Section */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-gray-700" />
              <h2 className="text-3xl font-bold text-gray-900">Clearance Deals</h2>
            </div>
            <p className="text-gray-600 ml-11">Final reductions on remaining stock</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendedProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />

                  {/* Clearance badge */}
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    CLEARANCE
                  </div>

                  {/* Stock remaining */}
                  <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(Math.random() * 20) + 5} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Shop Flash Sales?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Deals that move quickly - act fast!' },
              { icon: '💰', title: 'Massive Savings', desc: 'Up to 70% off regular prices' },
              { icon: '📦', title: 'Limited Stock', desc: 'Exclusive deals with limited quantities' },
              { icon: '🚚', title: 'Quick Shipping', desc: 'Fast delivery on flash sale items' },
            ].map((item) => (
              <div key={item.title} className="text-center">
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
