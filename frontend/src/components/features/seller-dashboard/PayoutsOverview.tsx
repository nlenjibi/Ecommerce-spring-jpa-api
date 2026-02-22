import React from 'react';

export default function PayoutsOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Payouts & Earnings</h4>
      <div className="mt-3 text-sm text-gray-700">
        <div className="flex items-center justify-between"><div>Total Earnings</div><div className="font-semibold">$1,240.00</div></div>
        <div className="flex items-center justify-between mt-2"><div>Available Balance</div><div className="font-semibold">$320.00</div></div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Request Payout</button>
          <button className="px-3 py-1 border rounded">View History</button>
        </div>
      </div>
    </div>
  );
}
