'use client';

import { DeliveryMethod } from '@/types';
import { useDelivery } from '@/context/DeliveryContext';

interface DeliveryMethodSelectorProps {
  selected: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
  townId: number | null;
  disabled?: boolean;
}

/**
 * DeliveryMethodSelector Component
 * 
 * Allows users to choose between delivery methods with real-time fee display.
 * - BUS_STATION: Delivery to nearest bus station
 * - HOME_DELIVERY: Delivery to home/work address
 * 
 * Fetches and displays delivery fees based on selected town.
 */
export default function DeliveryMethodSelector({
  selected,
  onSelect,
  townId,
  disabled = false,
}: DeliveryMethodSelectorProps) {
  const { getDeliveryFee } = useDelivery();

  const methods = [
    {
      id: 'BUS_STATION' as DeliveryMethod,
      label: 'Bus Station Pickup',
      description: 'Collect from nearest bus station',
      icon: '🚌',
    },
    {
      id: 'HOME_DELIVERY' as DeliveryMethod,
      label: 'Home Delivery',
      description: 'Delivered to your address',
      icon: '🏠',
    },
  ];

  const formatFee = (feeObj: { fee: number } | null) => {
    if (feeObj === null) return 'Select location first';
    const fee = feeObj.fee;
    if (fee === 0) return 'FREE';
    return `₵${fee.toFixed(2)}`;
  };

  return (
    <div className="space-y-3">
      <label className="text-lg font-semibold text-gray-800">Delivery Method</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => {
          const feeObj = townId ? getDeliveryFee(townId, method.id as any) : null;
          
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              disabled={disabled || !townId}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              } ${disabled || !townId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl">{method.icon}</div>
                <div className={`text-sm font-semibold ${
                  feeObj && feeObj.fee === 0 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {formatFee(feeObj)}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{method.label}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
