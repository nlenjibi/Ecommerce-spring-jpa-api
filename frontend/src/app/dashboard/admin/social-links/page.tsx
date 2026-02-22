'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocialLinks } from '@/context/SocialLinksContext';
import { SocialPlatform, SocialLink } from '@/types';
import toast from 'react-hot-toast';
import { Save, AlertCircle } from 'lucide-react';

export default function AdminSocialLinksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { socialLinks, updateSocialLink, loading } = useSocialLinks();
  const [editedLinks, setEditedLinks] = useState<Record<string, { url: string | null; isActive: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Authorization check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Initialize edited links when social links load
  useEffect(() => {
    if (socialLinks.length > 0) {
      const initialized: Record<string, { url: string | null; isActive: boolean }> = {};
      socialLinks.forEach(link => {
        initialized[link.platform] = {
          url: link.url,
          isActive: link.isActive,
        };
      });
      setEditedLinks(initialized);
    }
  }, [socialLinks]);

  // Validate URL format
  const validateUrl = (url: string | null): boolean => {
    if (!url) return true; // null is valid (no link assigned)

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (platform: string, url: string) => {
    setEditedLinks(prev => ({
      ...prev,
      [platform]: { ...prev[platform], url: url || null },
    }));

    // Clear validation error for this field
    if (validationErrors[platform]) {
      setValidationErrors(prev => ({
        ...prev,
        [platform]: '',
      }));
    }
  };

  const handleToggle = (platform: string) => {
    setEditedLinks(prev => ({
      ...prev,
      [platform]: { ...prev[platform], isActive: !prev[platform]?.isActive },
    }));
  };

  const handleSaveLink = async (platform: string) => {
    const link = editedLinks[platform];
    if (!link) return;

    // Validate URL
    if (!validateUrl(link.url)) {
      setValidationErrors(prev => ({
        ...prev,
        [platform]: 'Invalid URL format',
      }));
      toast.error('Please enter a valid URL');
      return;
    }

    setSaving(true);
    try {
      await updateSocialLink(platform as SocialPlatform, link.url, link.isActive);
    } catch (error) {
      console.error('Failed to save link:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    // Validate all URLs first
    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.entries(editedLinks).forEach(([platform, link]) => {
      if (!validateUrl(link.url)) {
        errors[platform] = 'Invalid URL format';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      toast.error('Please fix invalid URLs');
      return;
    }

    setSaving(true);
    try {
      // Save all modified links
      const savePromises = Object.entries(editedLinks).map(([platform, link]) => {
        const originalLink = socialLinks.find(l => l.platform === platform);
        // Only save if changed
        if (
          originalLink?.url !== link.url ||
          originalLink?.isActive !== link.isActive
        ) {
          return updateSocialLink(platform as SocialPlatform, link.url, link.isActive);
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);
    } catch (error) {
      console.error('Failed to save links:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Social Links</h1>
          <p className="text-gray-600">
            Configure URLs for social media platforms. Icons are fixed and always visible.
            Assign URLs or leave blank to disable the link.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Fixed Platform Icons</h3>
            <p className="text-sm text-blue-800">
              Admin can only manage URLs. Icons cannot be changed. All 7 platforms are always visible.
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading social links...
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      URL
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {socialLinks.map((link) => (
                    <tr key={link.platform} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {link.platform}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="url"
                          placeholder="https://example.com/@username"
                          value={editedLinks[link.platform]?.url || ''}
                          onChange={(e) => handleUrlChange(link.platform, e.target.value)}
                          disabled={saving}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors[link.platform]
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                            }`}
                        />
                        {validationErrors[link.platform] && (
                          <p className="text-xs text-red-600 mt-1">
                            {validationErrors[link.platform]}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(link.platform)}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editedLinks[link.platform]?.isActive
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editedLinks[link.platform]?.isActive
                                ? 'translate-x-6'
                                : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSaveLink(link.platform)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Save All Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveAll}
                  disabled={saving || Object.keys(validationErrors).length > 0}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save All Changes
                </button>
              </div>
            </>
          )}
        </div>

        {/* Guidelines */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Leave URL blank to disable the link (icon will be greyed out)</li>
            <li>✓ Use full URLs starting with https:// (e.g., https://twitter.com/@yourusername)</li>
            <li>✓ Toggle "Active" to enable/disable visibility</li>
            <li>✓ All platforms are always displayed to users</li>
            <li>✓ Disabled links appear greyed out but remain visible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
