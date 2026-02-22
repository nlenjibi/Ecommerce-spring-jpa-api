"use client";
import React from 'react';
import OrderCard from './OrderCard';

type Props = { orders: any[] };

export default function RecentOrders({ orders = [] }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <div className="text-sm text-blue-600">View all</div>
      </div>

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="p-6 bg-white rounded-lg text-center text-gray-500">No recent orders.</div>
        ) : (
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        )}
      </div>
    </section>
  );
}
