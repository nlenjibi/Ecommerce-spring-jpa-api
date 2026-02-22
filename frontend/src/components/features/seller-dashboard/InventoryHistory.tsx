"use client";
import React from 'react';

export default function InventoryHistory({ history = [] }: { history?: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Inventory History</h4>
      <div className="mt-3 text-sm text-gray-700">
        {history.length === 0 ? (
          <div className="text-gray-500">No inventory changes yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>{h.note}</div>
                <div className="text-xs text-gray-500">{h.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
