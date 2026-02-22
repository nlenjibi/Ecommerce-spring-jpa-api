'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Gift, Star, Sparkles } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { UrgencyBadge } from '../urgency-badges';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../../ui/Button';
import { Product } from '@/types';
import { SkeletonProductCardGrid, SkeletonCategoryCardGrid } from '../../skeletons';

interface HolidayHomepageProps {
  holidayProducts?: Product[];
  giftProducts?: Product[];
  categories?: Array<{ name: string; slug: string; image: string; count?: number }>;
  isLoading?: boolean;
  holiday?: 'valentine' | 'christmas' | 'easter' | 'general';
}

/**
 * Holiday Sale Homepage
 *
 * Features:
 * - Festive holiday theme with hearts, gifts, and sparkles
 * - "Holiday Cheer" messaging
 * - Gift-focused product sections
 * - Special holiday categories
 * - Animated festive elements
 * - Gift wrapping and personalization options
 */
export function HolidayHomepage({
  holidayProducts = [],
  giftProducts = [],
  categories = [],
  isLoading = false,
  holiday = 'general',
}: HolidayHomepageProps) {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Holiday configurations
  const holidayConfig = {
    valentine: {
      name: 'Valentine\'s',
      colors: {
        primary: 'from-pink-500 to-red-500',
        secondary: 'from-pink-100 to-red-50',
        accent: 'pink',
        text: 'text-pink-600',
      },
      icon: Heart,
      emoji: '💝',
      message: 'Spread love with amazing Valentine\'s deals!',
      discount: 'UP TO 75% OFF',
      theme: 'Love & Romance',
    },
    christmas: {
      name: 'Christmas',
      colors: {
        primary: 'from-green-600 to-red-600',
        secondary: 'from-green-100 to-red-50',
        accent: 'green',
        text: 'text-green-600',
      },
      icon: Gift,
      emoji: '🎄',
      message: 'Make this Christmas merry and bright with great deals!',
      discount: 'UP TO 80% OFF',
      theme: 'Festive Gifts',
    },
    easter: {
      name: 'Easter',
      colors: {
        primary: 'from-yellow-400 to-purple-500',
        secondary: 'from-yellow-100 to-purple-50',
        accent: 'yellow',
        text: 'text-yellow-600',
      },
      icon: Sparkles,
      emoji: '🐰',
      message: 'Hop into savings with Easter specials!',
      discount: 'UP TO 60% OFF',
      theme: 'Spring Celebration',
    },
    general: {
      name: 'Holiday',
      colors: {
        primary: 'from-purple-500 to-indigo-600',
        secondary: 'from-purple-100 to-indigo-50',
        accent: 'purple',
        text: 'text-purple-600',
      },
      icon: Star,
      emoji: '🎉',
      message: 'Celebrate the season with unbeatable holiday deals!',
      discount: 'UP TO 70% OFF',
      theme: 'Special Occasions',
    },
  };

  const currentHoliday = holidayConfig[holiday];

  // Default categories if not provided
  const defaultCategories = categories.length > 0 ? categories : [
    { name: 'Gifts & Presents', slug: 'gifts', image: '🎁' },
    { name: 'Fashion & Accessories', slug: 'fashion', image: '👗' },
    { name: 'Home & Decor', slug: 'home-decor', image: '🏠' },
    { name: 'Electronics & Gadgets', slug: 'electronics', image: '📱' },
    { name: 'Beauty & Wellness', slug: 'beauty', image: '💄' },
    { name: 'Books & Entertainment', slug: 'books', image: '📚' },
    { name: 'Kitchen & Dining', slug: 'kitchen', image: '🍳' },
    { name: 'Sports & Outdoors', slug: 'sports', image: '⚽' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Holiday Banner Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-r ${currentHoliday.colors.primary} text-white`}>
        {/* Animated holiday elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 left-1/4 w-96 h-96 bg-${currentHoliday.colors.accent}-300 rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-${currentHoliday.colors.accent}-200 rounded-full blur-3xl animate-pulse animation-delay-2000`} />
          {/* Floating holiday icons */}
          <div className="absolute top-1/4 right-1/3 animate-bounce">
            <currentHoliday.icon className={`w-8 h-8 text-${currentHoliday.colors.accent}-200`} />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce animation-delay-1000">
            <Sparkles className={`w-6 h-6 text-${currentHoliday.colors.accent}-300`} />
          </div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side */}
            <div className="z-10">
              {/* Holiday Icon */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <currentHoliday.icon className={`w-12 h-12 text-${currentHoliday.colors.accent}-200`} />
                  <div className={`absolute inset-0 bg-${currentHoliday.colors.accent}-300/30 rounded-full blur-xl animate-ping`} />
                </div>
                <span className="text-2xl font-bold">{currentHoliday.emoji} {currentHoliday.name} Sale</span>
              </div>

              {/* Badge */}
              <div className="mb-4 inline-block">
                <UrgencyBadge type="limited" size="md" animate={true} />
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                HOLIDAY CHEER
              </h1>

              {/* Subheading */}
              <p className="text-2xl sm:text-3xl font-bold mb-6 text-yellow-200">
                {currentHoliday.discount}
              </p>

              {/* Description */}
              <p className="text-lg mb-8 text-gray-100 leading-relaxed max-w-md">
                {currentHoliday.message} Perfect gifts and festive finds at amazing prices.
              </p>

              {/* Countdown */}
              <div className="mb-8 bg-black/20 backdrop-blur-sm p-4 rounded-xl inline-block">
                <p className="text-sm font-semibold mb-3 text-yellow-200">CELEBRATION ENDS IN</p>
                <CountdownTimer
                  endDate={saleEndDate}
                  size="lg"
                  format="full"
                  showLabels={true}
                />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/products?holiday=${holiday}`}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold w-full sm:w-auto">
                    <Gift className="w-5 h-5 mr-2" />
                    SHOP {currentHoliday.name.toUpperCase()} DEALS
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Gift Finder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Holiday Image */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square">
                <div className={`absolute inset-0 bg-gradient-to-br from-${currentHoliday.colors.accent}-300 to-transparent rounded-full opacity-30 blur-2xl`} />
                <div className="absolute inset-8 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <div className="text-6xl font-black text-yellow-200">{currentHoliday.discount.split(' ')[2]}</div>
                </div>
                {/* Floating gifts */}
                <div className="absolute top-4 right-4 animate-bounce">
                  <Gift className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="absolute bottom-4 left-4 animate-bounce animation-delay-500">
                  <Heart className="w-6 h-6 text-pink-300" />
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

      {/* Gift Categories Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentHoliday.theme} Categories</h2>
          <p className="text-gray-600">Find the perfect {currentHoliday.name.toLowerCase()} gifts and essentials</p>
        </div>

        {isLoading ? (
          <SkeletonCategoryCardGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {defaultCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/categories/${cat.slug}?holiday=${holiday}`}
                className="group"
              >
                <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center hover:-translate-y-1 bg-gradient-to-br ${currentHoliday.colors.secondary}`}>
                  {/* Circular background */}
                  <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-${currentHoliday.colors.accent}-100 to-${currentHoliday.colors.accent}-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md relative`}>
                    <span className="text-4xl">{typeof cat.image === 'string' && cat.image.length === 1 ? cat.image : '🛍️'}</span>
                    {/* Gift ribbon */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Gift className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {cat.name}
                  </h3>

                  {/* Item count */}
                  {cat.count && (
                    <p className="text-xs text-gray-500">{cat.count} gift options</p>
                  )}

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-${currentHoliday.colors.accent}-600/0 group-hover:bg-${currentHoliday.colors.accent}-600/5 transition-colors duration-300`} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Holiday Deals Section */}
      {holidayProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <currentHoliday.icon className={`w-8 h-8 ${currentHoliday.colors.text}`} />
              <h2 className="text-3xl font-bold text-gray-900">{currentHoliday.name} Specials</h2>
            </div>
            <p className="text-gray-600 ml-11">Celebrate with these festive favorites</p>
          </div>

          {isLoading ? (
            <SkeletonProductCardGrid count={5} />
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-4 md:gap-6 min-w-min md:min-w-full md:grid md:grid-cols-5">
                {holidayProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-48 md:w-auto md:flex-shrink">
                    <div className="relative">
                      <ProductCard product={product} />

                      {/* Holiday badge */}
                      <div className={`absolute top-2 left-2 bg-${currentHoliday.colors.accent}-500 text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {currentHoliday.emoji} {currentHoliday.name}
                      </div>

                      {/* Gift indicator */}
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        🎁 Gift
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

      {/* Gift Ideas Section */}
      {giftProducts.length > 0 && (
        <section className={`bg-gradient-to-r ${currentHoliday.colors.secondary} py-16`}>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfect Gift Ideas</h2>
              <p className="text-gray-600">Thoughtful presents for every occasion</p>
            </div>

            {isLoading ? (
              <SkeletonProductCardGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {giftProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />

                    {/* Gift badge */}
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      🎁 PERFECT GIFT
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-2 right-2 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded">
                      From GHS {product.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Shop Holiday Sales?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎁', title: 'Perfect Gifts', desc: 'Curated selections for every recipient' },
              { icon: '💰', title: 'Holiday Savings', desc: 'Special pricing for the festive season' },
              { icon: '🚚', title: 'Gift Delivery', desc: 'Reliable shipping for holiday deadlines' },
              { icon: '⭐', title: 'Quality Assured', desc: 'Premium products at great prices' },
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
