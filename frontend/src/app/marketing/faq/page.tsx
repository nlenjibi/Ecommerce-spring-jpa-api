'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I place an order?',
    answer:
      'Simply browse our products, add items to your cart, and proceed to checkout. You can pay using credit/debit cards, PayPal, or other available payment methods. Once your payment is confirmed, you\'ll receive an order confirmation email.',
  },
  {
    id: 2,
    question: 'What is your shipping policy?',
    answer:
      'We offer free shipping on orders over $50. Standard shipping typically takes 5-7 business days, while express shipping is available for 2-3 business days. Orders are processed within 1-2 business days before shipment.',
  },
  {
    id: 3,
    question: 'Can I return products?',
    answer:
      'Yes! We offer a 30-day return policy for most items. Products must be unused and in original condition with packaging. To initiate a return, contact our support team with your order number.',
  },
  {
    id: 4,
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package in real-time on the carrier\'s website.',
  },
  {
    id: 5,
    question: 'Do you offer bulk discounts?',
    answer:
      'Yes! We offer special pricing for bulk orders. Please contact our sales team at sales@shophub.com for a custom quote on orders of 10+ items.',
  },
  {
    id: 6,
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All payments are securely processed.',
  },
  {
    id: 7,
    question: 'How can I change or cancel my order?',
    answer:
      'If your order hasn\'t shipped yet, you can cancel or modify it. Please contact us within 1 hour of placing your order. Once shipped, you\'ll need to initiate a return instead.',
  },
  {
    id: 8,
    question: 'Is my personal information secure?',
    answer:
      'Yes! We use industry-standard SSL encryption to protect your personal and payment information. Your data is never shared with third parties without your consent.',
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100">Find answers to common questions about ShopHub</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0 ml-4">
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedId === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 border border-blue-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

