'use client';

import { Order, OrderTimeline } from '@/types';

interface OrderTrackingTimelineProps {
  order: Order;
}

/**
 * OrderTrackingTimeline Component
 * 
 * Visual timeline showing order status progression:
 * - Pending → Paid → Processing → Shipped → Delivered/Picked up
 * 
 * Displays timestamps and location information for each stage.
 */
export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  // Define status stages
  const stages = [
    { status: 'pending', label: 'Order Placed', icon: '📋' },
    { status: 'paid', label: 'Payment Confirmed', icon: '✓' },
    { status: 'processing', label: 'Processing', icon: '⚙️' },
    { status: 'shipped', label: 'Shipped', icon: '📦' },
    {
      status: order.deliveryDetails?.method === 'BUS_STATION' ? 'ready_for_pickup' : 'delivered',
      label: order.deliveryDetails?.method === 'BUS_STATION' ? 'Ready for Pickup' : 'Delivered',
      icon: order.deliveryDetails?.method === 'BUS_STATION' ? '🚌' : '✓',
    },
  ];

  // Get current stage index
  const currentStageIndex = stages.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-900">#{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold text-gray-900">₦{order.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-blue-600 capitalize">{order.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-6">Order Timeline</h3>

        <div className="space-y-6">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;

            // Find timeline entry for this stage
            const timelineEntry = order.timeline?.find((t) => t.status === stage.status);

            return (
              <div key={stage.status} className="flex gap-4">
                {/* Timeline Marker */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stage.icon}
                  </div>

                  {/* Connector Line */}
                  {index < stages.length - 1 && (
                    <div
                      className={`w-1 h-12 mt-2 ${
                        isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    />
                  )}
                </div>

                {/* Timeline Content */}
                <div className="pt-1 flex-1">
                  <p
                    className={`font-semibold ${
                      isCompleted
                        ? 'text-gray-900'
                        : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </p>

                  {timelineEntry && (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(timelineEntry.timestamp).toLocaleString()}
                      </p>
                      {timelineEntry.description && (
                        <p className="text-sm text-gray-700 mt-1">{timelineEntry.description}</p>
                      )}
                      {timelineEntry.location && (
                        <p className="text-sm text-gray-600 mt-1">📍 {timelineEntry.location}</p>
                      )}
                    </>
                  )}

                  {isCurrent && !timelineEntry && (
                    <p className="text-sm text-blue-600 mt-1">Currently at this stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3">Delivery Details</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Method:</span>
            <span className="font-medium text-gray-900">
              {order.deliveryDetails?.method === 'BUS_STATION'
                ? 'Bus Station Pickup'
                : order.deliveryDetails?.method === 'DIRECT_ADDRESS'
                ? 'Direct Address Delivery'
                : 'Express Shipping'}
            </span>
          </div>

          {order.deliveryDetails?.method === 'BUS_STATION' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-700">Station:</span>
                <span className="font-medium text-gray-900">{order.deliveryDetails.busStationName}</span>
              </div>
              {order.deliveryDetails.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Contact:</span>
                  <span className="font-medium text-gray-900">{order.deliveryDetails.phone}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery To:</span>
                <span className="font-medium text-gray-900">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Contact:</span>
                <span className="font-medium text-gray-900">
                  {order.shippingAddress.phone}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2 border-t border-blue-200">
            <span className="text-gray-700">Estimated Delivery:</span>
            <span className="font-medium text-gray-900">
              {order.deliveryDetails?.estimatedDays || 3} day
              {(order.deliveryDetails?.estimatedDays || 3) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
              {item.productImage && (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                ₦{(item.quantity * item.price).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee:</span>
              <span>₦{order.deliveryFee.toLocaleString()}</span>
            </div>
          )}
          {order.shippingCost > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Shipping Cost:</span>
              <span>₦{order.shippingCost.toLocaleString()}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span>₦{order.tax.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg text-gray-900 border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
