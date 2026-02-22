'use client';

import { useState } from 'react';
import { Pagination } from '@/components/features/admin/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Plus, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface TagItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export default function AdminTagsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();

  // Helper to generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tags', { page }],
    queryFn: () => adminApi.getTags(),
  });

  // Support multiple possible response shapes from API
  const tags = data?.tags || (data as any)?.data?.tags || [];
  const totalPages = (data as any)?.totalPages || (data as any)?.data?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (name: string) => adminApi.createTag({ name, slug: generateSlug(name) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      toast.success('Tag created successfully');
      setIsModalOpen(false);
      setTagName('');
    },
    onError: () => toast.error('Failed to create tag'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: () => toast.error('Failed to delete tag'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      createMutation.mutate(tagName.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Manage product tags for better organization</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading tags...</div>
        ) : tags?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No tags found</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags?.map((tag: TagItem) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full group hover:bg-gray-200 transition-colors"
              >
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-gray-500">({tag.productCount || 0})</span>
                <button
                  onClick={() => {
                    if (confirm('Delete this tag?')) {
                      deleteMutation.mutate(tag.id);
                    }
                  }}
                  className="ml-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Tag</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name *</label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tag name"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
