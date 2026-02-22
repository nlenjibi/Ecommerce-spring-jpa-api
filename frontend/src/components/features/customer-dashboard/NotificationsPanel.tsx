"use client";
import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell size={18} />
          Notifications
        </h3>
        <div className="text-sm text-gray-500">Recent</div>
      </div>
      <div className="text-sm text-gray-500 mt-3">
        No notifications yet
      </div>
    </div>
  );
}
