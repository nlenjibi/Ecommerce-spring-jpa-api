'use client';

import React from 'react';
import { Truck, Calendar, DollarSign, MapPin, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-blue-100">Learn about our shipping options and policies</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Shipping Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shipping Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Shipping */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center mb-4">
                <Truck className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Standard Shipping</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Delivery Time:</span> 5-7 business days
                </p>
                <p>
                  <span className="font-semibold">Cost:</span> Free on orders over $50, otherwise $7.99
                </p>
                <p>
                  <span className="font-semibold">Perfect for:</span> Non-urgent orders
                </p>
              </div>
            </div>

            {/* Express Shipping */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
              <div className="flex items-center mb-4">
                <Truck className="w-8 h-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Express Shipping</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Delivery Time:</span> 2-3 business days
                </p>
                <p>
                  <span className="font-semibold">Cost:</span> $19.99 for all orders
                </p>
                <p>
                  <span className="font-semibold">Perfect for:</span> Urgent orders
                </p>
              </div>
            </div>

            {/* Overnight Shipping */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center mb-4">
                <Truck className="w-8 h-8 text-red-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Overnight Shipping</h3>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Delivery Time:</span> Next business day
                </p>
                <p>
                  <span className="font-semibold">Cost:</span> $49.99 for all orders
                </p>
                <p>
                  <span className="font-semibold">Perfect for:</span> Last-minute needs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Processing & Timeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Processing Timeline</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Order Placement</h3>
                  <p className="text-gray-600">Your order is received and confirmation email is sent</p>
                  <p className="text-sm text-gray-500">Immediate</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Processing</h3>
                  <p className="text-gray-600">Your items are picked, packed, and prepared for shipment</p>
                  <p className="text-sm text-gray-500">1-2 business days</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Shipment</h3>
                  <p className="text-gray-600">Your package is handed to the carrier and tracking number is provided</p>
                  <p className="text-sm text-gray-500">Varies by shipping method</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delivery</h3>
                  <p className="text-gray-600">Your package arrives at your doorstep</p>
                  <p className="text-sm text-gray-500">Signature may be required for high-value items</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Regions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Where We Ship</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Domestic Shipping</h3>
              </div>
              <p className="text-gray-600 mb-4">
                We ship to all 50 US states, including Alaska and Hawaii. Standard rates apply.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>✓ All US States</li>
                <li>✓ US Territories</li>
                <li>✓ Military Addresses (APO/FPO)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">International Shipping</h3>
              </div>
              <p className="text-gray-600 mb-4">
                We ship to most countries worldwide. International rates and delivery times vary.
              </p>
              <p className="text-sm text-gray-500 italic">
                Contact us for international shipping quotes and timelines.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="bg-yellow-50 rounded-lg p-8 border border-yellow-200">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Important Shipping Notes</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Delivery times are estimates and do not include weekends or holidays</li>
                <li>• Orders placed after 5 PM EST are processed the next business day</li>
                <li>• Tracking information is provided via email once your order ships</li>
                <li>• We're not responsible for delays caused by carriers or weather</li>
                <li>• Signature may be required for orders over $500</li>
                <li>• Packages left at your address are your responsibility once delivered</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

