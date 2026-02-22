'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsletterSubscribe } from './NewsletterSubscribe';
import { useSocialLinks } from '@/context/SocialLinksContext';
import { useAppDownloadLinks } from '@/context/AppDownloadLinksContext';
import { SocialPlatform, AppPlatform } from '@/types';
import {
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Youtube,
  MessageSquare,
  Apple,
  Smartphone,
  Bell,
  Lock,
  TrendingDown,
  AlertCircle,
  Package,
  Tag,
  CreditCard,
  ChevronUp,
  Shield,
  Award,
  ArrowUp,
  ChevronDown,
  Globe,
  MapPin,
  MessageSquare as MessageIcon,
  Star,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

// Social media icons mapping
const SOCIAL_ICONS: Record<SocialPlatform, React.ReactNode> = {
  [SocialPlatform.X]: <Twitter className="w-5 h-5" />,
  [SocialPlatform.FACEBOOK]: <Facebook className="w-5 h-5" />,
  [SocialPlatform.INSTAGRAM]: <Instagram className="w-5 h-5" />,
  [SocialPlatform.TELEGRAM]: <MessageCircle className="w-5 h-5" />,
  [SocialPlatform.TIKTOK]: <Music2 className="w-5 h-5" />,
  [SocialPlatform.YOUTUBE]: <Youtube className="w-5 h-5" />,
  [SocialPlatform.WHATSAPP]: <MessageSquare className="w-5 h-5" />,
};

// App store icons mapping
const APP_ICONS: Record<AppPlatform, { icon: React.ReactNode; label: string }> = {
  [AppPlatform.APPLE_APP_STORE]: {
    icon: <Apple className="w-5 h-5" />,
    label: 'Apple App Store',
  },
  [AppPlatform.GOOGLE_PLAY_STORE]: {
    icon: <Smartphone className="w-5 h-5" />,
    label: 'Google Play Store',
  },
};

// Mobile app features
const APP_FEATURES = [
  { icon: TrendingDown, label: 'Price-drop alerts' },
  { icon: Lock, label: 'Faster & more secure checkout' },
  { icon: Tag, label: 'Exclusive offers' },
  { icon: AlertCircle, label: 'Low stock alerts' },
  { icon: Package, label: 'Order tracking' },
  { icon: Bell, label: 'Coupon alerts' },
];

// Security badges
const SECURITY_BADGES = [
  { icon: Shield, label: 'SSL Certificate', color: 'text-green-400' },
  { icon: Lock, label: 'Payment Security', color: 'text-blue-400' },
  { icon: Award, label: 'Trust Badge', color: 'text-amber-400' },
  { icon: Award, label: 'Verified Secure', color: 'text-purple-400' },
];

// Payment methods
const PAYMENT_METHODS = [
  { label: 'Visa', icon: '💳', color: 'bg-blue-100 text-blue-700' },
  { label: 'Mastercard', icon: '💳', color: 'bg-red-100 text-red-700' },
  { label: 'Discover', icon: '💳', color: 'bg-orange-100 text-orange-700' },
  { label: 'Amex', icon: '💳', color: 'bg-green-100 text-green-700' },
  { label: 'PayPal', icon: '🔐', color: 'bg-blue-100 text-blue-900' },
  { label: 'Google Pay', icon: '📱', color: 'bg-gray-100 text-gray-700' },
  { label: 'Apple Pay', icon: '🍎', color: 'bg-black text-white' },
];

export function Footer() {
  const { socialLinks } = useSocialLinks();
  const { appDownloadLinks } = useAppDownloadLinks();
  const [mounted, setMounted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedMobileSections, setExpandedMobileSections] = useState<Set<string>>(new Set(['company']));
  const [supportOnline, setSupportOnline] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileSection = (section: string) => {
    const newSections = new Set(expandedMobileSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedMobileSections(newSections);
  };

  const renderMobileSection = (title: string, sectionKey: string, children: React.ReactNode) => (
    <div className="md:hidden border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleMobileSection(sectionKey)}
        className="w-full flex items-center justify-between py-4 px-0 text-left hover:text-gray-300 transition-colors"
        aria-expanded={expandedMobileSections.has(sectionKey)}
        aria-controls={`footer-${sectionKey}`}
      >
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            expandedMobileSections.has(sectionKey) ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {expandedMobileSections.has(sectionKey) && (
        <div id={`footer-${sectionKey}`} className="pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white border-t border-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* DESKTOP: 4 Column Layout */}
          <div className="hidden md:grid grid-cols-4 gap-8 mb-12">
            {/* Column 1: Company Info & Social */}
            <div className="space-y-8">
              <div>
                <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  ShopHub
                </Link>
                <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                  Your one-stop destination for quality products at affordable prices. Shop with confidence on our secure platform.
                </p>
              </div>

              {mounted && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-4">Follow Us</h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => {
                      const isDisabled = !link.url || !link.isActive;
                      return (
                        <a
                          key={link.platform}
                          href={link.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${
                            isDisabled
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                          }`}
                          title={link.platform}
                          aria-label={`Visit our ${link.platform}`}
                          onClick={(e) => isDisabled && e.preventDefault()}
                        >
                          {SOCIAL_ICONS[link.platform]}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Customer Service */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Customer Service</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/help" className="text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Security & Trust */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Security & Trust</h3>
              <div className="space-y-3 mb-6">
                {SECURITY_BADGES.map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${badge.color}`} aria-hidden="true" />
                      <span className="text-gray-400 text-sm">{badge.label}</span>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 rounded text-xs text-gray-400 hover:bg-gray-700 transition-colors"
                    title={method.label}
                  >
                    <span>{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Newsletter & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Get exclusive deals, new arrivals, and special offers delivered to your inbox.
              </p>
              <div className="mb-8">
                <NewsletterSubscribe />
              </div>

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms-of-service" className="text-gray-400 text-xs hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 text-xs hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 text-xs hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Cookie Preferences
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 text-xs hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-300">
                    Ad Choices
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* MOBILE: Accordion Layout */}
          <div className="md:hidden space-y-6 divide-y divide-gray-700">
            {/* Company Info */}
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                ShopHub
              </Link>
              <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                Your one-stop shopping destination. Quality products, affordable prices, secure checkout.
              </p>

              {mounted && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase mb-3">Follow Us</h4>
                  <div className="flex gap-2 flex-wrap">
                    {socialLinks.slice(0, 7).map((link) => {
                      const isDisabled = !link.url || !link.isActive;
                      return (
                        <a
                          key={link.platform}
                          href={link.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2.5 rounded-full transition-all duration-300 ${
                            isDisabled
                              ? 'bg-gray-700 text-gray-500'
                              : 'bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white active:scale-95'
                          }`}
                          aria-label={`Visit our ${link.platform}`}
                          onClick={(e) => isDisabled && e.preventDefault()}
                        >
                          {SOCIAL_ICONS[link.platform]}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile App Section */}
            {renderMobileSection('Get the App', 'app', (
              <div className="space-y-3">
                <p className="text-gray-400 text-xs">Exclusive mobile features:</p>
                <div className="space-y-2">
                  {APP_FEATURES.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-gray-400 text-xs">
                        <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" aria-hidden="true" />
                        <span>{feature.label}</span>
                      </div>
                    );
                  })}
                </div>

                {mounted && (
                  <div className="flex flex-col gap-2 mt-4">
                    {appDownloadLinks.map((link) => {
                      const isDisabled = !link.url || !link.isActive;
                      const appInfo = APP_ICONS[link.platform as AppPlatform];
                      if (!appInfo) return null;

                      return (
                        <a
                          key={link.platform}
                          href={link.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded font-semibold text-xs transition-all duration-300 active:scale-95 ${
                            isDisabled
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                          }`}
                          onClick={(e) => isDisabled && e.preventDefault()}
                        >
                          {appInfo.icon}
                          <span>{appInfo.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Customer Service Accordion */}
            {renderMobileSection('Customer Service', 'service', (
              <div className="space-y-2">
                {[
                  { label: 'Help Center', href: '/help' },
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Shipping Info', href: '/shipping' },
                  { label: 'Returns & Refunds', href: '/returns' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors py-1"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Security & Trust Accordion */}
            {renderMobileSection('Security & Trust', 'security', (
              <div className="space-y-3">
                {SECURITY_BADGES.map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${badge.color}`} aria-hidden="true" />
                      <span className="text-gray-400 text-sm">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Payment Methods Accordion */}
            {renderMobileSection('Payment Methods', 'payment', (
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 rounded text-xs text-gray-400 hover:bg-gray-700 transition-colors"
                    title={method.label}
                  >
                    <span>{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Legal Accordion */}
            {renderMobileSection('Legal', 'legal', (
              <div className="space-y-2">
                <Link href="/terms-of-service" className="block text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors py-1">
                  Terms of Use
                </Link>
                <Link href="/privacy-policy" className="block text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors py-1">
                  Privacy Policy
                </Link>
                <a href="#" className="block text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors py-1">
                  Cookie Preferences
                </a>
                <a href="#" className="block text-gray-400 text-sm hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors py-1">
                  Ad Choices
                </a>
              </div>
            ))}

            {/* Newsletter Mobile */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Newsletter</h3>
              <p className="text-gray-400 text-xs mb-3">Get exclusive deals and offers.</p>
              <NewsletterSubscribe />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Section */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs">
              © {currentYear} ShopHub. All rights reserved. | Secure • Trusted • Fast
            </p>

            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${supportOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
                role="img"
                aria-label={supportOnline ? 'Support is online' : 'Support is offline'}
              />
              <span className="text-gray-400">
                Support is <span className={supportOnline ? 'text-green-400' : 'text-red-400'}>{supportOnline ? 'Online' : 'Offline'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </footer>
  );
}
