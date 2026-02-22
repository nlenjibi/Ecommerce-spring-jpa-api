'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppDownloadLinks } from '@/context/AppDownloadLinksContext';
import { AppPlatform } from '@/types';
import toast from 'react-hot-toast';
import { Save, AlertCircle, Download } from 'lucide-react';

const PLATFORM_INFO: Record<AppPlatform, { name: string; description: string }> = {
  [AppPlatform.APPLE_APP_STORE]: {
    name: 'Apple App Store',
    description: 'URL to download the app from Apple App Store',
  },
  [AppPlatform.GOOGLE_PLAY_STORE]: {
    name: 'Google Play Store',
    description: 'URL to download the app from Google Play Store',
  },
};

export default function AdminAppDownloadLinksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { appDownloadLinks, updateAppDownloadLink, loading } = useAppDownloadLinks();
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

  // Initialize edited links when app download links load
  useEffect(() => {
    if (appDownloadLinks.length > 0) {
      const initialized: Record<string, { url: string | null; isActive: boolean }> = {};
      appDownloadLinks.forEach(link => {
        initialized[link.platform] = {
          url: link.url,
          isActive: link.isActive,
        };
      });
      setEditedLinks(initialized);
    }
  }, [appDownloadLinks]);

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
      await updateAppDownloadLink(platform as AppPlatform, link.url, link.isActive);
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
        const originalLink = appDownloadLinks.find(l => l.platform === platform);
        // Only save if changed
        if (
          originalLink?.url !== link.url ||
          originalLink?.isActive !== link.isActive
        ) {
          return updateAppDownloadLink(platform as AppPlatform, link.url, link.isActive);
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
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Download Our App</h1>
          </div>
          <p className="text-gray-600">
            Configure app store links for the "Download Our App" section displayed in the footer.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Always Visible Icons</h3>
            <p className="text-sm text-blue-800">
              Both Apple App Store and Google Play Store icons are always displayed. Leave URL blank to disable the link.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {appDownloadLinks.map((link) => (
            <div key={link.platform} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Platform Name */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {PLATFORM_INFO[link.platform as AppPlatform]?.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {PLATFORM_INFO[link.platform as AppPlatform]?.description}
                </p>
              </div>

              {/* URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Store URL
                </label>
                <input
                  type="url"
                  placeholder="https://apps.apple.com/app/..."
                  value={editedLinks[link.platform]?.url || ''}
                  onChange={(e) => handleUrlChange(link.platform, e.target.value)}
                  disabled={saving}
                  className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors[link.platform]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                    }`}
                />
                {validationErrors[link.platform] && (
                  <p className="text-xs text-red-600 mt-2">
                    {validationErrors[link.platform]}
                  </p>
                )}
              </div>

              {/* Toggle Active */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active</p>
                  <p className="text-xs text-gray-500">Show this link to users</p>
                </div>
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
              </div>

              {/* Save Button */}
              <button
                onClick={() => handleSaveLink(link.platform)}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          ))}
        </div>

        {/* Save All Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSaveAll}
            disabled={saving || Object.keys(validationErrors).length > 0}
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            Save All Changes
          </button>
        </div>

        {/* Guidelines */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Both app store links are always visible in the footer</li>
            <li>✓ Use full URLs (e.g., https://apps.apple.com/app/...)</li>
            <li>✓ Leave blank to disable a store link (icon will be greyed out)</li>
            <li>✓ Toggle "Active" to control visibility</li>
            <li>✓ Disabled links appear greyed out but remain visible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
