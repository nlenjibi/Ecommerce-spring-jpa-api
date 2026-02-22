import React from 'react';

export default function TopProducts({ items = [] }: { items?: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Top Products</h4>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        {items.length === 0 ? (
          <li className="text-gray-500">No data</li>
        ) : (
          items.map((it: any) => (
            <li key={it.id} className="flex items-center justify-between">
              <div>{it.name}</div>
              <div className="text-xs text-gray-500">{it.sold} sold</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
