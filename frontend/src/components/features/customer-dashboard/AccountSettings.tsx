"use client";
import React from 'react';

export default function AccountSettings() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold">Account Settings</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Profile</div>
            <div className="text-xs text-gray-500">Inter, user@you.com</div>
          </div>
          <button className="px-3 py-1 bg-gray-100 rounded">Edit</button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Security</div>
            <div className="text-xs text-gray-500">Change password</div>
          </div>
          <button className="px-3 py-1 bg-gray-100 rounded">Manage</button>
        </div>
      </div>
    </div>
  );
}
