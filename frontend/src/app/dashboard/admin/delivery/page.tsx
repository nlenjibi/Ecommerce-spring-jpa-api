'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/api';
import { Region, DeliveryFee } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Admin Delivery Configuration Page
 * 
 * Manage delivery system:
 * - Create, update, delete regions
 * - Create, update, delete towns within regions
 * - Create, update, delete bus stations within towns
 * - Set delivery fees based on method and location
 */
export default function DeliveryManagementPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('regions');
  const [regions, setRegions] = useState<Region[]>([]);
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Region form
  const [regionForm, setRegionForm] = useState({
    name: '',
    code: '',
    country: '',
  });
  const [editingRegionId, setEditingRegionId] = useState<number | null>(null);

  // Fee form
  const [feeForm, setFeeForm] = useState({
    townId: '',
    method: 'BUS_STATION',
    baseFee: '',
    perKmFee: '',
    estimatedDays: '2',
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Check if user is admin (you might want to check a role field)
    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Load data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'regions') {
          const response = await ordersApi.getRegions();
          setRegions(response.regions || []);
        } else if (activeTab === 'fees') {
          const response = await ordersApi.getDeliveryFees();
          setFees(response.fees || []);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        setError(message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, activeTab]);

  // Handle region operations
  const handleSaveRegion = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!regionForm.name || !regionForm.code) {
        setError('Please fill in required fields');
        return;
      }

      if (editingRegionId) {
        await ordersApi.adminUpdateRegion(editingRegionId, regionForm);
        setSuccess('Region updated successfully');
      } else {
        await ordersApi.adminCreateRegion(regionForm);
        setSuccess('Region created successfully');
      }

      // Reload regions
      const response = await ordersApi.getRegions();
      setRegions(response.regions || []);

      setRegionForm({ name: '', code: '', country: '' });
      setEditingRegionId(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save region';
      setError(message);
    }
  };

  const handleDeleteRegion = async (id: number) => {
    if (!confirm('Delete this region?')) return;

    try {
      setError(null);
      await ordersApi.adminDeleteRegion(id);
      setRegions((prev) => prev.filter((r) => r.id !== id));
      setSuccess('Region deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete region';
      setError(message);
    }
  };

  const handleEditRegion = (region: Region) => {
    setRegionForm({
      name: region.name,
      code: region.code,
      country: region.country,
    });
    setEditingRegionId(region.id);
  };

  // Handle fee operations
  const handleSaveFee = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!feeForm.townId || !feeForm.baseFee) {
        setError('Please fill in required fields');
        return;
      }

      await ordersApi.adminCreateDeliveryFee({
        townId: Number(feeForm.townId),
        method: feeForm.method,
        baseFee: Number(feeForm.baseFee),
        perKmFee: feeForm.perKmFee ? Number(feeForm.perKmFee) : 0,
        estimatedDays: Number(feeForm.estimatedDays),
      });

      setSuccess('Delivery fee created successfully');

      // Reload fees
      const response = await ordersApi.getDeliveryFees();
      setFees(response.fees || []);

      setFeeForm({
        townId: '',
        method: 'BUS_STATION',
        baseFee: '',
        perKmFee: '',
        estimatedDays: '2',
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save fee';
      setError(message);
    }
  };

  const handleDeleteFee = async (id: number) => {
    if (!confirm('Delete this delivery fee?')) return;

    try {
      setError(null);
      await ordersApi.adminDeleteDeliveryFee(id);
      setFees((prev) => prev.filter((f) => f.id !== id));
      setSuccess('Fee deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete fee';
      setError(message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Configuration</h1>
        <p className="text-gray-600 mb-8">Manage regions, towns, stations, and delivery fees</p>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {[
            { id: 'regions', label: 'Regions' },
            { id: 'fees', label: 'Delivery Fees' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="space-y-6">
            {/* Create/Edit Region Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingRegionId ? 'Edit Region' : 'Add New Region'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Region Name *"
                    value={regionForm.name}
                    onChange={(e) =>
                      setRegionForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Lagos"
                  />
                  <Input
                    label="Region Code *"
                    value={regionForm.code}
                    onChange={(e) =>
                      setRegionForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="LG"
                  />
                  <Input
                    label="Country"
                    value={regionForm.country}
                    onChange={(e) =>
                      setRegionForm((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="Nigeria"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveRegion}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingRegionId ? 'Update Region' : 'Create Region'}
                  </Button>
                  {editingRegionId && (
                    <Button
                      onClick={() => {
                        setRegionForm({ name: '', code: '', country: '' });
                        setEditingRegionId(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Regions List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Regions</h3>
              </div>

              {loading ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : regions.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No regions yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {regions.map((region) => (
                        <tr key={region.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {region.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{region.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{region.country}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleEditRegion(region)}
                              className="text-blue-600 hover:text-blue-700 font-medium mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRegion(region.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Create Fee Form */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Delivery Fee</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town *
                    </label>
                    <input
                      type="number"
                      value={feeForm.townId}
                      onChange={(e) =>
                        setFeeForm((prev) => ({ ...prev, townId: e.target.value }))
                      }
                      placeholder="Town ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Method
                    </label>
                    <select
                      value={feeForm.method}
                      onChange={(e) =>
                        setFeeForm((prev) => ({ ...prev, method: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BUS_STATION">Bus Station</option>
                      <option value="DIRECT_ADDRESS">Direct Address</option>
                      <option value="SHIPPING">Shipping</option>
                    </select>
                  </div>

                  <Input
                    label="Base Fee (₦) *"
                    type="number"
                    value={feeForm.baseFee}
                    onChange={(e) =>
                      setFeeForm((prev) => ({ ...prev, baseFee: e.target.value }))
                    }
                    placeholder="500"
                  />

                  <Input
                    label="Per KM Fee (₦)"
                    type="number"
                    value={feeForm.perKmFee}
                    onChange={(e) =>
                      setFeeForm((prev) => ({ ...prev, perKmFee: e.target.value }))
                    }
                    placeholder="0"
                  />

                  <Input
                    label="Est. Days *"
                    type="number"
                    value={feeForm.estimatedDays}
                    onChange={(e) =>
                      setFeeForm((prev) => ({ ...prev, estimatedDays: e.target.value }))
                    }
                    placeholder="2"
                  />
                </div>

                <Button
                  onClick={handleSaveFee}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Delivery Fee
                </Button>
              </div>
            </div>

            {/* Fees List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Delivery Fees</h3>
              </div>

              {loading ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : fees.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No fees configured yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Base Fee
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Per KM Fee
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Est. Days
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {fee.method}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ₦{fee.baseFee.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ₦{fee.perKmFee ? fee.perKmFee.toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {fee.estimatedDays} days
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDeleteFee(fee.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
