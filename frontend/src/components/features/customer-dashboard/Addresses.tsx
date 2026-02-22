"use client";
import React from 'react';
import { MapPin } from 'lucide-react';
import { useCustomerAddresses } from '@/hooks/customer/use-customer-graphql';

export default function Addresses() {
  const { addresses, loading } = useCustomerAddresses();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin size={18} />
          Saved Addresses
        </h3>
        <button className="text-sm text-blue-600">Add</button>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500 mt-3">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-sm text-gray-500 mt-3">No saved addresses</div>
      ) : (
        <div className="mt-3 space-y-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="text-sm text-gray-700 border p-3 rounded">
              <div className="font-medium">{addr.label}</div>
              <div>{addr.street}</div>
              <div>{addr.city}, {addr.state} {addr.postalCode}</div>
              <div>{addr.country}</div>
              <div className="text-xs text-gray-500">{addr.phone}</div>
              <div className="mt-3 flex gap-2">
                <button className="px-2 py-1 border rounded">Edit</button>
                <button className="px-2 py-1 border rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
