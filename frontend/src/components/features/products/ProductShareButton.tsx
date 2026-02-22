'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProductShareButtonProps {
  productName: string;
  productPrice: number;
  productImage?: string;
  productUrl?: string;
}

/**
 * ProductShareButton Component
 * 
 * Enables users to share products via:
 * - Native Web Share API (WhatsApp, Facebook, Twitter, etc.)
 * - Fallback modal with manual share options
 * - Copy link to clipboard
 * 
 * Optimized for African mobile-first users.
 */
export default function ProductShareButton({
  productName,
  productPrice,
  productImage,
  productUrl,
}: ProductShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use current URL if productUrl not provided
  const shareUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out ${productName} for ₦${productPrice.toLocaleString()} on ShopHub!`;

  // Handle native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled, show modal instead
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Share error:', err);
        }
      }
    } else {
      // Fallback: show modal
      setShowShareModal(true);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  // Share to Facebook
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  // Share to Twitter
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  // Share to Telegram
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  return (
    <>
      {/* Share Button */}
      <Button
        onClick={handleNativeShare}
        variant="outline"
        className="flex items-center justify-center gap-2"
      >
        <span>📤</span>
        Share
      </Button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 md:items-center">
          <div className="bg-white w-full md:w-96 rounded-t-lg md:rounded-lg p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-4 gap-3">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <span className="text-4xl">📱</span>
                <span className="text-xs text-center text-gray-700 font-medium">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <span className="text-4xl">👍</span>
                <span className="text-xs text-center text-gray-700 font-medium">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-sky-50 transition-colors"
              >
                <span className="text-4xl">𝕏</span>
                <span className="text-xs text-center text-gray-700 font-medium">Twitter</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegramShare}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                <span className="text-4xl">✈️</span>
                <span className="text-xs text-center text-gray-700 font-medium">Telegram</span>
              </button>
            </div>

            {/* Copy Link */}
            <div className="border-t pt-4">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-900 transition-colors"
              >
                {copied ? '✓ Link Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
              <p>Sharing: <strong>{productName}</strong></p>
              <p>Price: <strong>₦{productPrice.toLocaleString()}</strong></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
