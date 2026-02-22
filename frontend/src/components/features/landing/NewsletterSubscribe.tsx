'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { newsletterApi } from '@/lib/api';

export function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);

    try {
      await newsletterApi.subscribe(email);
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('This email is already subscribed');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
      console.error('Newsletter subscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Mail className="w-4 h-4" />
        {isLoading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
