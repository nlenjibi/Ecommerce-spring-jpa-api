"use client";
import React from 'react';

export default function ReviewsList({ reviews = [] }: { reviews?: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Product Reviews</h4>
      <div className="mt-3 space-y-3 text-sm text-gray-700">
        {reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          reviews.map((r: any) => (
            <div key={r.id} className="border rounded p-2">
              <div className="flex items-center justify-between"><div className="font-medium">{r.title || 'Review'}</div><div className="text-xs text-gray-500">{r.rating}/5</div></div>
              <div className="mt-1 text-xs text-gray-600">{r.body}</div>
              <div className="mt-2 text-xs text-gray-500">By {r.user}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
