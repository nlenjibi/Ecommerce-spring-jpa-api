'use client';

import React from 'react';
import { Award, Users, Globe, Zap, Heart, Leaf } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Quality',
    description: 'We carefully curate our product selection to ensure the highest quality standards.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Customer First',
    description: 'Your satisfaction is our top priority. We go above and beyond to serve you.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Global Reach',
    description: 'We ship to customers worldwide, bringing quality products to your doorstep.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Innovation',
    description: 'We continuously improve our platform to provide the best shopping experience.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Community',
    description: 'We believe in building a community of satisfied customers and partners.',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Sustainability',
    description: 'We\'re committed to environmentally friendly practices and ethical sourcing.',
  },
];

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Anderson',
    role: 'Founder & CEO',
    image: '/placeholder.svg',
    bio: 'Serial entrepreneur with 15+ years of experience in e-commerce and retail.',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'Chief Product Officer',
    image: '/placeholder.svg',
    bio: 'Product visionary focused on creating seamless shopping experiences.',
  },
  {
    id: '3',
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    image: '/placeholder.svg',
    bio: 'Tech innovator building scalable platforms that serve millions of customers.',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    role: 'Director of Operations',
    image: '/placeholder.svg',
    bio: 'Operations expert ensuring smooth logistics and customer satisfaction.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We're on a mission to make shopping easy, enjoyable, and accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Founded in 2015, our journey began with a simple idea: make quality products affordable and accessible to everyone. What started as a small team working from a garage has grown into a thriving e-commerce platform serving millions of customers worldwide.
            </p>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              We've always believed that great customer service and quality products go hand in hand. We've invested heavily in technology and logistics to ensure fast delivery, competitive pricing, and exceptional customer support.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Today, we're proud to be one of the fastest-growing e-commerce platforms, with a diverse product range spanning electronics, fashion, home and garden, sports, and much more.
            </p>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <span className="text-gray-400 text-lg">Company Image</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5M+</div>
              <p className="text-gray-600">Active Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-gray-600">Products Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-blue-600 flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-300 h-48 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA Section */}
      <div className="bg-blue-600 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Have Questions?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch with our team for any inquiries or feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/help"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
