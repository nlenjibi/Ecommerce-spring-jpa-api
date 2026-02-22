'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Sun, Snowflake, Flower } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { UrgencyBadge } from '../urgency-badges';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../../ui/Button';
import { Product } from '@/types';
import { SkeletonProductCardGrid, SkeletonCategoryCardGrid } from '../../skeletons';

interface SeasonalHomepageProps {
  seasonalProducts?: Product[];
  recommendedProducts?: Product[];
  categories?: Array<{ name: string; slug: string; image: string; count?: number }>;
  isLoading?: boolean;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}

/**
 * Seasonal Sale Homepage
 *
 * Features:
 * - Seasonal theme with nature-inspired colors
 * - Season-specific messaging and icons
 * - "Seasonal Refresh" branding
 * - Nature-themed animations
 * - Category highlights for seasonal items
 * - Weather-appropriate product suggestions
 */
export function SeasonalHomepage({
  seasonalProducts = [],
  recommendedProducts = [],
  categories = [],
  isLoading = false,
  season = 'spring',
}: SeasonalHomepageProps) {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Season configurations
  const seasonConfig = {
    spring: {
      name: 'Spring',
      colors: {
        primary: 'from-green-500 to-emerald-600',
        secondary: 'from-green-100 to-emerald-50',
        accent: 'green',
        text: 'text-green-600',
      },
      icon: Flower,
      emoji: '🌸',
      message: 'Bloom into savings with our Spring collection!',
      discount: 'UP TO 60% OFF',
    },
    summer: {
      name: 'Summer',
      colors: {
        primary: 'from-yellow-500 to-orange-500',
        secondary: 'from-yellow-100 to-orange-50',
        accent: 'yellow',
        text: 'text-yellow-600',
      },
      icon: Sun,
      emoji: '☀️',
      message: 'Heat up your summer with amazing deals!',
      discount: 'UP TO 50% OFF',
    },
    fall: {
      name: 'Fall',
      colors: {
        primary: 'from-amber-500 to-orange-600',
        secondary: 'from-amber-100 to-orange-50',
        accent: 'amber',
        text: 'text-amber-600',
      },
      icon: Leaf,
      emoji: '🍂',
      message: 'Fall into savings with autumn specials!',
      discount: 'UP TO 55% OFF',
    },
    winter: {
      name: 'Winter',
      colors: {
        primary: 'from-blue-500 to-indigo-600',
        secondary: 'from-blue-100 to-indigo-50',
        accent: 'blue',
        text: 'text-blue-600',
      },
      icon: Snowflake,
      emoji: '❄️',
      message: 'Warm up with winter wonders and great deals!',
      discount: 'UP TO 65% OFF',
    },
  };

  const currentSeason = seasonConfig[season];

  // Default categories if not provided
  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Fashion & Apparel', slug: 'fashion', image: '👕' },
    { name: 'Home & Garden', slug: 'home-garden', image: '🏠' },
    { name: 'Sports & Outdoors', slug: 'sports', image: '⚽' },
    { name: 'Beauty & Wellness', slug: 'beauty', image: '💄' },
    { name: 'Electronics', slug: 'electronics', image: '📱' },
    { name: 'Books & Media', slug: 'books', image: '📚' },
    { name: 'Kitchen & Dining', slug: 'kitchen', image: '🍳' },
    { name: 'Health & Fitness', slug: 'fitness', image: '💪' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seasonal Banner Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-r ${currentSeason.colors.primary} text-white`}>
        {/* Animated seasonal elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 left-1/4 w-96 h-96 bg-${currentSeason.colors.accent}-300 rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-${currentSeason.colors.accent}-200 rounded-full blur-3xl animate-pulse animation-delay-2000`} />
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side */}
            <div className="z-10">
              {/* Season Icon */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <currentSeason.icon className={`w-12 h-12 text-${currentSeason.colors.accent}-200`} />
                  <div className={`absolute inset-0 bg-${currentSeason.colors.accent}-300/30 rounded-full blur-xl animate-ping`} />
                </div>
                <span className="text-2xl font-bold">{currentSeason.emoji} {currentSeason.name} Sale</span>
              </div>

              {/* Badge */}
              <div className="mb-4 inline-block">
                <UrgencyBadge type="limited" size="md" animate={true} />
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                SEASONAL REFRESH
              </h1>

              {/* Subheading */}
              <p className="text-2xl sm:text-3xl font-bold mb-6 text-yellow-200">
                {currentSeason.discount}
              </p>

              {/* Description */}
              <p className="text-lg mb-8 text-gray-100 leading-relaxed max-w-md">
                {currentSeason.message} Discover fresh arrivals and seasonal favorites at unbeatable prices.
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
                <Link href={`/products?season=${season}`}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold w-full sm:w-auto">
                    <currentSeason.icon className="w-5 h-5 mr-2" />
                    SHOP {currentSeason.name.toUpperCase()}
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    View All Deals
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Seasonal Image */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square">
                <div className={`absolute inset-0 bg-gradient-to-br from-${currentSeason.colors.accent}-300 to-transparent rounded-full opacity-30 blur-2xl`} />
                <div className="absolute inset-8 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="text-6xl font-black text-yellow-200">{currentSeason.discount.split(' ')[2]}</div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Seasonal Categories</h2>
          <p className="text-gray-600">Explore {currentSeason.name.toLowerCase()} essentials and favorites</p>
        </div>

        {isLoading ? (
          <SkeletonCategoryCardGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {defaultCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/categories/${cat.slug}?season=${season}`}
                className="group"
              >
                <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center hover:-translate-y-1 bg-gradient-to-br ${currentSeason.colors.secondary}`}>
                  {/* Circular background */}
                  <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-${currentSeason.colors.accent}-100 to-${currentSeason.colors.accent}-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <span className="text-4xl">{typeof cat.image === 'string' && cat.image.length === 1 ? cat.image : '🛍️'}</span>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {cat.name}
                  </h3>

                  {/* Item count */}
                  {cat.count && (
                    <p className="text-xs text-gray-500">{cat.count} seasonal items</p>
                  )}

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-${currentSeason.colors.accent}-600/0 group-hover:bg-${currentSeason.colors.accent}-600/5 transition-colors duration-300`} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Seasonal Deals Section */}
      {seasonalProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <currentSeason.icon className={`w-8 h-8 ${currentSeason.colors.text}`} />
              <h2 className="text-3xl font-bold text-gray-900">{currentSeason.name} Specials</h2>
            </div>
            <p className="text-gray-600 ml-11">Perfect picks for the {currentSeason.name.toLowerCase()} season</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={5} />
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-4 md:gap-6 min-w-min md:min-w-full md:grid md:grid-cols-5">
                {seasonalProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-48 md:w-auto md:flex-shrink">
                    <div className="relative">
                      <ProductCard product={product} />

                      {/* Seasonal badge */}
                      <div className={`absolute top-2 left-2 bg-${currentSeason.colors.accent}-500 text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {currentSeason.name}
                      </div>

                      {/* Countdown */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Seasonal Recommendations</h2>
            <p className="text-gray-600">Customer favorites for {currentSeason.name.toLowerCase()}</p>
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
      <section className={`bg-gradient-to-r ${currentSeason.colors.secondary} py-16`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Shop Seasonal Sales?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: currentSeason.emoji, title: 'Seasonal Fresh', desc: `New ${currentSeason.name.toLowerCase()} arrivals daily` },
              { icon: '💰', title: 'Smart Savings', desc: 'Seasonal discounts on quality items' },
              { icon: '🌟', title: 'Trending Items', desc: `What's hot in ${currentSeason.name.toLowerCase()}` },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Quick shipping on seasonal orders' },
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
