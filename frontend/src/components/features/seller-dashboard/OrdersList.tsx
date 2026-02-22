"use client";
import React from 'react';

type Order = {
  id: string;
  buyer: string;
  items: { name: string; qty: number; sellerId: string }[];
  total: number;
  status: string;
  date: string;
};

export default function OrdersList({ orders = [] }: { orders?: Order[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Orders (your products only)</h3>
      </div>

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found.</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{o.id}</div>
                <div className="text-sm text-gray-500">{o.date}</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">Buyer: {o.buyer}</div>
              <div className="mt-2">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div>{it.name} × {it.qty}</div>
                    <div className="text-xs text-gray-500">For seller item</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm">Total: ${o.total.toFixed(2)}</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded">Mark Processing</button>
                  <button className="px-2 py-1 border rounded">Add Tracking</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
