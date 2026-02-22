'use client';

import { useState } from 'react';
import { UserAddress } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddress } from '@/context/AddressContext';

interface AddressDeliveryFormProps {
  selectedAddressId: number | null;
  onAddressSelect: (addressId: number, address: UserAddress) => void;
  onDirectAddress: (address: any) => void;
  useExisting: boolean;
  loading?: boolean;
}

/**
 * AddressDeliveryForm Component
 * 
 * Handles both selecting saved addresses and entering new addresses.
 * Uses AddressContext for centralized address management.
 * Allows users to save new addresses for future use.
 */
export default function AddressDeliveryForm({
  selectedAddressId,
  onAddressSelect,
  onDirectAddress,
  useExisting,
  loading = false,
}: AddressDeliveryFormProps) {
  const { addresses, loading: loadingAddresses, addAddress } = useAddress();
  
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    label: 'Home',
    country: 'Ghana',
  });
  const [saveAddress, setSaveAddress] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    try {
      const response = await addAddress(formData as any);
      
      if (saveAddress) {
        // Address saved successfully
        setSaveAddress(false);
      }
    } catch (err) {
      // Error handled in context
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = Number(e.target.value);
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      onAddressSelect(addressId, address);
    }
  };

  const handleSubmitDirect = () => {
    if (!formData.recipientName || !formData.phone || !formData.street || !formData.city) {
      return;
    }

    onDirectAddress({
      recipientName: formData.recipientName,
      phone: formData.phone,
      street: formData.street,
      city: formData.city,
      region: formData.region,
      postalCode: formData.postalCode,
      country: formData.country,
    });
  };

  const renderAddressForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Recipient Name *"
          name="recipientName"
          value={formData.recipientName}
          onChange={handleInputChange}
          placeholder="Full name"
        />
        <Input
          label="Phone Number *"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+233 XXX XXX XXX"
        />
      </div>

      <Input
        label="Street Address *"
        name="street"
        value={formData.street}
        onChange={handleInputChange}
        placeholder="House number, street name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="City *"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="City"
        />
        <Input
          label="Region *"
          name="region"
          value={formData.region}
          onChange={handleInputChange}
          placeholder="Region"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Postal Code"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          placeholder="Optional"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Label
          </label>
          <select
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </>
  );

  if (useExisting && loadingAddresses) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading saved addresses...</p>
      </div>
    );
  }

  if (useExisting && addresses.length > 0) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900">Select Delivery Address</h3>

        <select
          value={selectedAddressId || ''}
          onChange={handleAddressChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Choose a saved address</option>
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.label} - {address.street}, {address.city}
              {address.isDefault ? ' (Default)' : ''}
            </option>
          ))}
        </select>

        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-700 font-medium">
            + Enter New Address
          </summary>
          <div className="mt-4 space-y-3 p-3 bg-white rounded border border-gray-200">
            {renderAddressForm()}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900">Delivery Address</h3>

      {renderAddressForm()}

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={saveAddress}
          onChange={(e) => setSaveAddress(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Save this address for future use</span>
      </label>

      <Button
        onClick={saveAddress ? handleSaveAddress : handleSubmitDirect}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {saveAddress ? 'Save and Continue' : 'Continue'}
      </Button>
    </div>
  );
}