"use client";
import React from 'react';

export default function PayoutHistory({ items = [] }: { items?: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Payout History</h4>
      <div className="mt-3 text-sm text-gray-700">
        {items.length === 0 ? (
          <div className="text-gray-500">No payouts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((p: any) => (
                <tr key={p.id} className="border-t"><td className="py-2">{p.date}</td><td>${p.amount}</td><td>{p.status}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
