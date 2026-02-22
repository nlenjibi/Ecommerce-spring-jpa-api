"use client";
import React from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title = 'No items yet',
  description = 'You don\'t have any items here. Start shopping to see them listed.',
  actionText = 'Browse products',
  onAction,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="flex items-center justify-center">
        <div className="p-3 rounded-full bg-gray-100">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h4 className="mt-4 text-lg font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <div className="mt-4">
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm"
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}
