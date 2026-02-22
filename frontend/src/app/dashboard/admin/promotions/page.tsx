'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Plus, Edit, Trash2, X, Percent, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminPromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minPurchase: 0,
    maxUses: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => adminApi.getPromotions(),
  });

  const promotions = data?.promotions || [];

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createPromotion({
      code: data.code,
      discount: data.discountValue,
      type: data.discountType,
      startDate: data.startDate,
      endDate: data.endDate,
      minPurchase: data.minPurchase || undefined,
      maxUses: data.maxUses || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create promotion'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) =>
      adminApi.updatePromotion(id, {
        code: data.code,
        discount: data.discountValue,
        type: data.discountType,
        startDate: data.startDate,
        endDate: data.endDate,
        minPurchase: data.minPurchase || undefined,
        maxUses: data.maxUses || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update promotion'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion deleted successfully');
    },
    onError: () => toast.error('Failed to delete promotion'),
  });

  const openModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        minPurchase: promotion.minPurchase,
        maxUses: promotion.maxUses,
        startDate: promotion.startDate?.split('T')[0] || '',
        endDate: promotion.endDate?.split('T')[0] || '',
        isActive: promotion.isActive,
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minPurchase: 0,
        maxUses: 0,
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Promotion
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Code</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Discount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Min. Purchase</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Usage</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Valid Period</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading promotions...</td>
                </tr>
              ) : promotions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No promotions found</td>
                </tr>
              ) : (
                promotions?.map((promo: Promotion) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-500" />
                        <span className="font-mono font-medium">{promo.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${promo.minPurchase.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {promo.usedCount} / {promo.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        !promo.isActive ? 'bg-gray-100 text-gray-700' :
                        isExpired(promo.endDate) ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {!promo.isActive ? 'Inactive' : isExpired(promo.endDate) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(promo)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this promotion?')) deleteMutation.mutate(promo.id);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingPromotion ? 'Edit Promotion' : 'Add Promotion'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20% off your order"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Purchase</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Active</span>
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingPromotion ? 'Save Changes' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
