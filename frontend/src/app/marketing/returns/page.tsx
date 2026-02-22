'use client';

import React from 'react';
import { RotateCcw, Clock, ShoppingCart, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Returns & Refunds</h1>
          <p className="text-xl text-blue-100">Easy and hassle-free returns</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Return Policy Overview */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-blue-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Return Policy Overview</h2>
            <p className="text-gray-600 mb-4">
              We want you to be completely satisfied with your purchase. If for any reason you're not
              happy with your item, we offer a hassle-free 30-day return policy.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-900 font-semibold">
                ✓ 30-day return window from the date of delivery
              </p>
            </div>
          </div>
        </section>

        {/* Return Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Return an Item</h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Our Support Team</h3>
                <p className="text-gray-600 mb-2">
                  Email support@shophub.com or call 1-800-SHOPHUB with your order number and reason for return.
                </p>
                <p className="text-sm text-gray-500">You have 30 days from delivery date to initiate a return</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive Return Authorization</h3>
                <p className="text-gray-600 mb-2">
                  We'll provide you with a return authorization number (RMA) and prepaid shipping label.
                </p>
                <p className="text-sm text-gray-500">No need to pay for return shipping!</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ship the Item Back</h3>
                <p className="text-gray-600 mb-2">
                  Pack the item securely with original packaging if available. Include the RMA number on the outside
                  of the box.
                </p>
                <p className="text-sm text-gray-500">Use the prepaid shipping label we provided</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive Your Refund</h3>
                <p className="text-gray-600 mb-2">
                  Once we receive and inspect your item, we'll process your refund to your original payment method.
                </p>
                <p className="text-sm text-gray-500">Refunds typically appear within 5-10 business days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Return Eligibility */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Return Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600 text-xl">✓</span> Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Unused items in original condition</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>All original packaging and tags intact</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Within 30 days of delivery</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Defective or damaged items</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Wrong item received</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600 text-xl">✗</span> Not Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Items used or worn</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Missing original packaging or tags</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>After 30-day return window</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Clearance or final sale items</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Items purchased from third-party sellers</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Refund Details */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Refund Details</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <ShoppingCart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Full Refund</h3>
                  <p className="text-gray-600">
                    You'll receive a full refund of the item price. Shipping costs are non-refundable unless
                    the item is defective.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                  <p className="text-gray-600">
                    Refunds are processed within 5-10 business days after we receive and inspect your return.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <RotateCcw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Original Payment Method</h3>
                  <p className="text-gray-600">
                    Refunds are always issued to your original payment method. Credit card refunds may take
                    1-2 billing cycles to appear.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="bg-yellow-50 rounded-lg p-8 border border-yellow-200">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Return authorization must be obtained before shipping items back</li>
                <li>• Items returned without an RMA number may not be accepted</li>
                <li>• We inspect returned items for signs of use or damage</li>
                <li>• Partial refunds may be issued for items that don't meet return conditions</li>
                <li>• Exchanges are processed as returns followed by new orders</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

