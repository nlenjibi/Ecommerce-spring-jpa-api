'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Mail,
  Share2,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImportResult {
  totalRequested: number;
  successful: number;
  failed: number;
  errors: string[];
  successfulProductIds: number[];
  failedProductIds: number[];
}

interface ImportExportToolsProps {
  className?: string;
}

export function ImportExportTools({ className = '' }: ImportExportToolsProps) {
  const { 
    wishlist, 
    addToWishlist, 
    addMultipleToWishlist,
    clearWishlist,
    shareWishlist,
  } = useWishlist();
  const { user, token, isAuthenticated } = useAuth();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Export to CSV
  const exportToCSV = () => {
    if (wishlist.length === 0) {
      toast.error('Wishlist is empty');
      return;
    }

    setIsExporting(true);
    try {
      const headers = [
        'Product ID',
        'Product Name',
        'SKU',
        'Price',
        'Discount Price',
        'Category',
        'Added Date',
        'Priority',
        'Desired Quantity',
        'Notes',
        'Target Price',
        'Collection',
        'Tags',
        'In Stock',
        'URL',
      ];

      const csvContent = [
        headers.join(','),
        ...wishlist.map(item => [
          item.productId,
          `"${item.product.name.replace(/"/g, '""')}"`,
          `"${item.product.sku || ''}"`,
          item.product.price,
          item.product.discountPrice || '',
          `"${item.product.category?.name || ''}"`,
          new Date(item.addedAt).toISOString().split('T')[0],
          item.priority,
          item.desiredQuantity,
          `"${(item.notes || '').replace(/"/g, '""')}"`,
          item.targetPrice || '',
          `"${(item.collectionName || '').replace(/"/g, '""')}"`,
          `"${(item.tags || []).join('; ')}"`,
          item.inStock ? 'Yes' : 'No',
          `"${window.location.origin}/product/${item.product.slug || item.productId}"`,
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wishlist-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Wishlist exported to CSV successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!isAuthenticated || !user || !token) {
      toast.error('Please login to export to PDF');
      return;
    }

    if (wishlist.length === 0) {
      toast.error('Wishlist is empty');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/v1/wishlist/export/pdf?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wishlist-export-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Wishlist exported to PDF successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Import from CSV
  const importFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated || !user || !token) {
      toast.error('Please login to import wishlist');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse CSV (simple implementation)
      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        if (values[0]) { // Product ID exists
          items.push({
            productId: parseInt(values[0]),
            notes: values[9] || undefined,
            priority: values[7] as any || 'MEDIUM',
            desiredQuantity: parseInt(values[8]) || 1,
            targetPrice: values[10] ? parseFloat(values[10]) : undefined,
            collectionName: values[11] || undefined,
            tags: values[12] ? values[12].split('; ').filter(Boolean) : undefined,
          });
        }
      }

      if (items.length === 0) {
        throw new Error('No valid items found in CSV');
      }

      // Use bulk import API
      const response = await fetch(`/api/v1/wishlist/bulk/add?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        throw new Error('Failed to import items');
      }

      const data = await response.json();
      if (data.success) {
        setImportResult(data.data);
        toast.success(`Imported ${data.data.successful} of ${data.data.totalRequested} items`);
      }
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  // Handle share wishlist
  const handleShareWishlist = async () => {
    if (!isAuthenticated || !user || !token) {
      toast.error('Please login to share wishlist');
      return;
    }

    try {
      const result = await shareWishlist({
        shareName: `${user.firstName || 'My'}'s Wishlist`,
        description: 'Check out my awesome wishlist!',
      });
      
      const fullShareUrl = `${window.location.origin}/wishlist/shared/${result.shareToken}`;
      setShareUrl(fullShareUrl);
      setShowShareModal(true);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share wishlist');
    }
  };

  // Copy share URL
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Email wishlist
  const emailWishlist = () => {
    const subject = encodeURIComponent('Check out my wishlist!');
    const body = encodeURIComponent(`Hi!\n\nI wanted to share my wishlist with you:\n\n${shareUrl}\n\nBest regards!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import & Export</h3>
            <p className="text-sm text-gray-600">
              Manage your wishlist data
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Export Wishlist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={isExporting || wishlist.length === 0}
              className="flex items-center gap-2 justify-start"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export as CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={isExporting || wishlist.length === 0 || !isAuthenticated}
              className="flex items-center gap-2 justify-start"
            >
              <FileText className="w-4 h-4" />
              Export as PDF
            </Button>
          </div>
          {wishlist.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Add items to your wishlist to enable export
            </p>
          )}
        </div>

        {/* Import Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Import Wishlist</h4>
          <div className="space-y-3">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              className="hidden"
            />
            
            <Button
              variant="outline"
              onClick={() => csvInputRef.current?.click()}
              disabled={isImporting || !isAuthenticated}
              className="flex items-center gap-2 justify-start w-full"
            >
              <Upload className="w-4 h-4" />
              Import from CSV
            </Button>
            
            {!isAuthenticated && (
              <p className="text-xs text-gray-500">
                Please login to import items to your wishlist
              </p>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Share Wishlist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleShareWishlist}
              disabled={!isAuthenticated || wishlist.length === 0}
              className="flex items-center gap-2 justify-start"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const subject = encodeURIComponent('My Wishlist');
                const body = encodeURIComponent(`Here's my wishlist:\n\n${wishlist.map(item => `• ${item.product.name} - $${item.product.price}`).join('\n')}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              disabled={wishlist.length === 0}
              className="flex items-center gap-2 justify-start"
            >
              <Mail className="w-4 h-4" />
              Email List
            </Button>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded-lg border ${
            importResult.successful > 0 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-start gap-3">
              {importResult.successful > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-2">
                  Import Complete
                </h5>
                <div className="text-sm space-y-1">
                  <div>
                    Successfully imported: <span className="font-semibold text-green-600">
                      {importResult.successful}
                    </span> / {importResult.totalRequested} items
                  </div>
                  {importResult.failed > 0 && (
                    <div>
                      Failed to import: <span className="font-semibold text-red-600">
                        {importResult.failed}
                      </span> items
                    </div>
                  )}
                </div>
                
                {importResult.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      View errors
                    </summary>
                    <ul className="text-xs text-red-600 mt-2 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImportResult(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">CSV Format Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• First row should contain headers</li>
                <li>• Required columns: Product ID, Product Name</li>
                <li>• Optional: Price, Priority, Notes, Target Price</li>
                <li>• Use commas to separate values</li>
                <li>• Quote text values with commas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Wishlist</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={copyShareUrl}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={emailWishlist}
                  className="flex items-center gap-2 justify-center"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="flex items-center gap-2 justify-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}