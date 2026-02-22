'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, HelpCircle, Truck, CreditCard, RotateCcw } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    id: 'account-1',
    category: 'Account & Registration',
    question: 'How do I create an account?',
    answer: 'To create an account, click on "Sign Up" in the header and fill in your email address, first name, last name, and password. You\'ll receive a confirmation email to verify your account. Once verified, you can start shopping!',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: 'account-2',
    category: 'Account & Registration',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a link to reset your password. Follow the instructions in the email to create a new password.',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: 'account-3',
    category: 'Account & Registration',
    question: 'Can I update my account information?',
    answer: 'Yes! Go to your dashboard and click on "Profile Settings". You can update your name, email address, phone number, and shipping address. Changes take effect immediately.',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: 'shipping-1',
    category: 'Shipping & Delivery',
    question: 'What are the shipping options?',
    answer: 'We offer multiple shipping options: Express Delivery (1-2 days), Standard Shipping (3-5 days), and In-Store Pickup (same day). Shipping costs vary by location and method. Express delivery costs more but is faster.',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'shipping-2',
    category: 'Shipping & Delivery',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can use this number on the carrier\'s website to track your package. You can also view tracking information in your order history on your dashboard.',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'shipping-3',
    category: 'Shipping & Delivery',
    question: 'Do you offer international shipping?',
    answer: 'Yes, we offer international shipping to over 100 countries. Shipping costs and delivery times vary by destination. You can see the shipping cost at checkout before placing your order.',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'payment-1',
    category: 'Payment & Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and Apple Pay. All payments are processed securely using industry-standard encryption.',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 'payment-2',
    category: 'Payment & Billing',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use SSL encryption and comply with PCI DSS standards to protect your payment information. We never store full credit card numbers on our servers.',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 'payment-3',
    category: 'Payment & Billing',
    question: 'Can I use multiple payment methods?',
    answer: 'Currently, you can use one payment method per order. However, you can save multiple payment methods in your account and choose which one to use at checkout.',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 'returns-1',
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on most items. Products must be in original condition with all packaging and accessories. Some items like electronics may have a 14-day return period. Check the product page for specific details.',
    icon: <RotateCcw className="w-5 h-5" />,
  },
  {
    id: 'returns-2',
    category: 'Returns & Refunds',
    question: 'How long do refunds take?',
    answer: 'After we receive your return, we process refunds within 5-7 business days. Depending on your bank, the refund may take an additional 2-5 business days to appear in your account.',
    icon: <RotateCcw className="w-5 h-5" />,
  },
  {
    id: 'returns-3',
    category: 'Returns & Refunds',
    question: 'Do I have to pay for return shipping?',
    answer: 'Return shipping costs depend on the reason for the return. If the item is defective or if we made an error, we\'ll provide a prepaid shipping label. For other returns, you may need to pay for return shipping.',
    icon: <RotateCcw className="w-5 h-5" />,
  },
];

const categories = Array.from(new Set(faqItems.map((item) => item.category)));

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions or contact our support team
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`block w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Articles
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`block w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="text-blue-600 flex-shrink-0">{item.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{item.category}</p>
                          <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedIds.has(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedIds.has(item.id) && (
                      <div className="border-t px-6 py-4 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">Try different keywords or browse by category</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MessageCircle className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
            <button className="text-blue-600 font-medium hover:text-blue-700">Start Chat</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <HelpCircle className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">We'll respond within 24 hours</p>
            <a href="mailto:support@ecommerce.com" className="text-blue-600 font-medium hover:text-blue-700">
              support@ecommerce.com
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Truck className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Order</h3>
            <p className="text-gray-600 mb-4">Check your order status and tracking info</p>
            <button className="text-blue-600 font-medium hover:text-blue-700">View Orders</button>
          </div>
        </div>
      </div>
    </div>
  );
}
