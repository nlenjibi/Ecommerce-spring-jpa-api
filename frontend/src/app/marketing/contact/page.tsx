'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, Share2, Twitter, Facebook, Instagram, MessageCircle, Music2, Youtube, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactApi } from '@/lib/api';
import { useSocialLinks } from '@/context/SocialLinksContext';
import { SocialPlatform } from '@/types';

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

export default function ContactPage() {
  const { socialLinks } = useSocialLinks();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.submitMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100">
            We're here to help and answer any question you might have.
          </p>
        </div>
      </div>

      {/* Contact Info + Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email</h3>
            </div>
            <p className="text-gray-600">
              <a href="mailto:support@shophub.com" className="hover:text-blue-600">
                support@shophub.com
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We respond within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Phone</h3>
            </div>
            <p className="text-gray-600">
              <a href="tel:1-800-7467482" className="hover:text-blue-600">
                1-800-SHOPHUB
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Monday to Friday, 9 AM to 5 PM EST
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Address</h3>
            </div>
            <p className="text-gray-600">
              123 Shopping Ave<br />
              Commerce City, CC 12345<br />
              United States
            </p>
          </div>
        </div>

        {/* Social Links Section */}
        {mounted && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Follow Us</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Connect with us on social media for the latest updates and exclusive offers.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const isDisabled = !link.url || !link.isActive;
                return (
                  <a
                    key={link.platform}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium ${
                      isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                    title={isDisabled ? `${link.platform} link not yet assigned` : `Visit our ${link.platform} page`}
                    onClick={(e) => isDisabled && e.preventDefault()}
                  >
                    {SOCIAL_ICONS[link.platform as SocialPlatform]}
                    {link.platform}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="How can we help?"
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Tell us more about your inquiry..."
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            All fields are required. We'll respond within 24 business hours.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are your hours?</h3>
              <p className="text-gray-600">
                We're available Monday to Friday, 9 AM to 5 PM EST. Weekend inquiries will be responded to on Monday.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does delivery take?</h3>
              <p className="text-gray-600">
                Standard shipping takes 5-7 business days. Express shipping available for 2-3 business day delivery.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you accept returns?</h3>
              <p className="text-gray-600">
                Yes! We offer a 30-day return policy on most items. Check our Returns page for full details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment methods?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and other payment methods at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
