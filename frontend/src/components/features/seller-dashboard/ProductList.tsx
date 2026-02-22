"use client";
import React from 'react';

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  active?: boolean;
};

export default function ProductList({ products = [] }: { products?: Product[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Products</h3>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Add Product</button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-gray-500">No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3 flex items-center gap-3">
                    <img src={p.image || '/placeholder.png'} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    <div>{p.name}</div>
                  </td>
                  <td>{p.sku}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>{p.active ? 'Active' : 'Inactive'}</td>
                  <td className="text-right">
                    <button className="px-2 py-1 mr-2 border rounded">Edit</button>
                    <button className="px-2 py-1 border rounded">Disable</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
