import React from 'react';

export default function InventoryOverview({ lowStock = [] }: { lowStock?: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Inventory</h4>
      <div className="mt-3 text-sm text-gray-700">
        <div>Low stock alerts: {lowStock.length}</div>
        <ul className="mt-2 space-y-1">
          {lowStock.length === 0 ? <li className="text-gray-500">All good</li> : lowStock.map((p: any) => <li key={p.id} className="flex items-center justify-between"><div>{p.name}</div><div className="text-xs text-red-600">{p.stock} left</div></li>)}
        </ul>
      </div>
    </div>
  );
}
