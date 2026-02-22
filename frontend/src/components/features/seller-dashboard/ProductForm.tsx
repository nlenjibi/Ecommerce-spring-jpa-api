"use client";
import React, { useState } from 'react';

type Props = {
  onSave?: (data: any) => void;
  initial?: any;
};

export default function ProductForm({ onSave, initial }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [sku, setSku] = useState(initial?.sku || '');
  const [price, setPrice] = useState(initial?.price || 0);
  const [stock, setStock] = useState(initial?.stock || 0);
  const [active, setActive] = useState(initial?.active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, sku, price, stock, active };
    onSave?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Add / Edit Product</h4>
      <div className="mt-3 space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="w-full px-2 py-1 border rounded" />
        <div className="grid grid-cols-2 gap-2">
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" className="px-2 py-1 border rounded" />
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" className="px-2 py-1 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="Stock" className="px-2 py-1 border rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          <button type="button" className="px-3 py-1 border rounded" onClick={() => { setName(''); setSku(''); setPrice(0); setStock(0); setActive(true); }}>Reset</button>
        </div>
      </div>
    </form>
  );
}
