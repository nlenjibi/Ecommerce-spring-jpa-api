'use client';

import { useState, useEffect } from 'react';
import { DeliveryMethod, DeliveryFee } from '@/types';
import { ordersApi } from '@/services/api';

interface DeliveryFeeDisplayProps {
  deliveryMethod: DeliveryMethod | null;
  townId?: number;
  subtotal: number;
  onFeeCalculated: (deliveryFee: number, shippingFee: number, estimatedDays: number) => void;
  loading?: boolean;
}

/**
 * DeliveryFeeDisplay Component
 * 
 * Displays and calculates delivery fees based on:
 * - Delivery method (bus station, direct address, shipping)
 * - Selected location (town/region)
 * - Subtotal amount
 * 
 * Updates parent component with calculated fees in real-time.
 */
export default function DeliveryFeeDisplay({
  deliveryMethod,
  townId,
  subtotal,
  onFeeCalculated,
  loading = false,
}: DeliveryFeeDisplayProps) {
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load delivery fees
  useEffect(() => {
    if (!deliveryMethod) return;

    const loadFees = async () => {
      try {
        setLoadingFees(true);
        setError(null);
        const response = await ordersApi.getDeliveryFees(townId);
        setFees(response.fees || []);

        // Calculate fee based on delivery method
        const applicableFees = (response.fees || []).filter(
          (f) => f.method === deliveryMethod && (!townId || f.townId === townId)
        );

        if (applicableFees.length > 0) {
          const fee = applicableFees[0];
          const calculatedDeliveryFee = fee.baseFee || 0;
          const calculatedShippingFee = fee.perKmFee ? Math.ceil(subtotal * 0.05) : 0; // 5% for long distance

          setDeliveryFee(calculatedDeliveryFee);
          setShippingFee(calculatedShippingFee);
          setEstimatedDays(fee.estimatedDays || 3);
          onFeeCalculated(calculatedDeliveryFee, calculatedShippingFee, fee.estimatedDays || 3);
        } else {
          // Default fees if no specific fee found
          let defaultFee = 0;
          let defaultShippingFee = 0;
          let defaultDays = 3;

          switch (deliveryMethod) {
            case DeliveryMethod.BUS_STATION:
              defaultFee = 500;
              defaultDays = 2;
              break;
            case DeliveryMethod.DIRECT_ADDRESS:
              defaultFee = 1500;
              defaultDays = 2;
              break;
            case DeliveryMethod.SHIPPING:
              defaultFee = 2500;
              defaultShippingFee = Math.ceil(subtotal * 0.1); // 10% for shipping
              defaultDays = 5;
              break;
          }

          setDeliveryFee(defaultFee);
          setShippingFee(defaultShippingFee);
          setEstimatedDays(defaultDays);
          onFeeCalculated(defaultFee, defaultShippingFee, defaultDays);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load delivery fees';
        setError(message);
        console.error('Error loading fees:', err);

        // Set default fees on error
        let defaultFee = 0;
        switch (deliveryMethod) {
          case DeliveryMethod.BUS_STATION:
            defaultFee = 500;
            break;
          case DeliveryMethod.DIRECT_ADDRESS:
            defaultFee = 1500;
            break;
          case DeliveryMethod.SHIPPING:
            defaultFee = 2500;
            break;
        }
        setDeliveryFee(defaultFee);
        setShippingFee(0);
        onFeeCalculated(defaultFee, 0, 3);
      } finally {
        setLoadingFees(false);
      }
    };

    loadFees();
  }, [deliveryMethod, townId, subtotal, onFeeCalculated]);

  if (!deliveryMethod) {
    return null;
  }

  const getMethodLabel = () => {
    switch (deliveryMethod) {
      case DeliveryMethod.BUS_STATION:
        return 'Bus Station Pickup';
      case DeliveryMethod.DIRECT_ADDRESS:
        return 'Direct Address Delivery';
      case DeliveryMethod.SHIPPING:
        return 'Express Shipping';
      default:
        return 'Delivery';
    }
  };

  const total = deliveryFee + shippingFee;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-900">{getMethodLabel()}</p>
            <p className="text-sm text-gray-600">
              Estimated delivery: {estimatedDays} day{estimatedDays !== 1 ? 's' : ''}
            </p>
          </div>
          {loadingFees && <p className="text-sm text-gray-600">Calculating...</p>}
        </div>

        {error && (
          <p className="text-sm text-orange-600">
            ⚠️ Using standard fee (fee calculation error)
          </p>
        )}

        {/* Fee Breakdown */}
        <div className="mt-3 space-y-1 border-t border-blue-200 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Delivery Fee:</span>
            <span className="font-medium text-gray-900">₦{deliveryFee.toLocaleString()}</span>
          </div>

          {shippingFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Shipping Fee:</span>
              <span className="font-medium text-gray-900">₦{shippingFee.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-semibold border-t border-blue-200 pt-2">
            <span className="text-gray-900">Total Delivery Cost:</span>
            <span className="text-blue-600">₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Additional Info */}
        {deliveryMethod === DeliveryMethod.BUS_STATION && (
          <p className="text-xs text-gray-600 pt-2">
            📍 You'll collect your order at the selected bus station
          </p>
        )}
        {deliveryMethod === DeliveryMethod.DIRECT_ADDRESS && (
          <p className="text-xs text-gray-600 pt-2">
            🚗 Delivery to your address by our logistics partner
          </p>
        )}
        {deliveryMethod === DeliveryMethod.SHIPPING && (
          <p className="text-xs text-gray-600 pt-2">
            ✈️ Express shipping via courier service to any location
          </p>
        )}
      </div>
    </div>
  );
}
