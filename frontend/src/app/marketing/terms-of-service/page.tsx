'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using ShopHub's website and services, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, please do not use our website.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              We grant you a limited, non-exclusive, non-transferable license to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access and use our website for personal, non-commercial purposes</li>
              <li>Purchase products and services from our store</li>
              <li>View, print, and download content for personal use</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Engage in any form of harassment, abuse, or discrimination</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Use automated bots or scraping tools without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Post false, misleading, or defamatory content</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Product Information</h2>
            <p className="text-gray-700 mb-4">
              While we strive to provide accurate product information, we do not warrant that product descriptions, pricing, or other content is error-free. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Correct inaccurate information</li>
              <li>Cancel or refuse orders</li>
              <li>Modify product prices or descriptions</li>
              <li>Limit product availability</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pricing and Payment</h2>
            <p className="text-gray-700 mb-4">
              All prices are in USD and subject to change without notice. We accept major credit cards, PayPal, and other payment methods as displayed at checkout. Prices do not include applicable taxes or shipping costs, which will be added at checkout.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Return and Refund Policy</h2>
            <p className="text-gray-700 mb-4">
              We offer a 30-day return policy for most items. Items must be unused, in original condition, and with original packaging. Please refer to our Returns & Refunds page for complete details.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              All content on our website, including text, images, logos, and trademarks, is the exclusive property of ShopHub or its content suppliers. Reproduction, distribution, or transmission without written permission is prohibited.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the fullest extent permitted by law, ShopHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business interruption, arising from the use of our website or services.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              Our website and services are provided "as is" without warranties of any kind. We disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              If you create an account, you are responsible for maintaining the confidentiality of your username and password. You agree to accept responsibility for all activities under your account. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible for their content, accuracy, or practices. Use of third-party websites is at your own risk.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Modification of Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our website implies acceptance of updated terms.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms are governed by and construed in accordance with the laws of the jurisdiction where ShopHub operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@shophub.com<br />
                <strong>Address:</strong> 123 Shopping Ave, Commerce City, CC 12345<br />
                <strong>Phone:</strong> 1-800-SHOPHUB
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions about our Terms?</h2>
          <p className="text-gray-600 mb-4">Contact our legal team for clarification</p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
