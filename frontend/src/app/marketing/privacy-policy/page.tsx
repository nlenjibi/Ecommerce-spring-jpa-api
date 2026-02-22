'use client';

import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              ShopHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">We collect information that you provide directly to us, such as:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Name and email address</li>
              <li>Shipping and billing address</li>
              <li>Phone number</li>
              <li>Payment information</li>
              <li>Account login credentials</li>
              <li>Wishlist and preferences</li>
              <li>Communication history</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">When you use our website, we automatically collect:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
              <li>Device information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Payment processors (for transaction data)</li>
              <li>Shipping carriers (for delivery tracking)</li>
              <li>Analytics providers</li>
              <li>Social media platforms (if you link accounts)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Processing orders and shipments</li>
              <li>Providing customer support</li>
              <li>Sending promotional emails and newsletters</li>
              <li>Improving our website and services</li>
              <li>Detecting fraudulent transactions</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We share information only with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Payment processors and financial institutions</li>
              <li>Shipping and delivery partners</li>
              <li>Service providers (email, analytics, etc.)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700">
              You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at privacy@shophub.com.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method is 100% secure.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies to enhance your experience. You can control cookies through your browser settings. Disabling cookies may affect website functionality.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our website is not intended for children under 13. We do not knowingly collect information from children. If we learn we have collected information from a child, we will delete it promptly.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700">
              Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data Retention</h2>
            <p className="text-gray-700 mb-4">We retain personal information for as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws different from your country.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this policy periodically. We will notify you of significant changes via email or prominent website notice. Your continued use of our website implies acceptance of updates.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For privacy-related questions, contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@shophub.com<br />
                <strong>Address:</strong> 123 Shopping Ave, Commerce City, CC 12345<br />
                <strong>Phone:</strong> 1-800-SHOPHUB
              </p>
            </div>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Last Updated: January 2026
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Questions about our Privacy Policy?</h2>
          <p className="text-gray-600 mb-4">Contact our privacy team for clarification</p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
