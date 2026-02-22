'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  X,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface GuestSessionInfo {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  itemCount: number;
}

interface GuestWishlistManagerProps {
  className?: string;
}

export function GuestWishlistManager({ className = '' }: GuestWishlistManagerProps) {
  const { 
    wishlist, 
    guestSessionId, 
    initGuestSession, 
    mergeGuestWishlist,
    isInWishlist,
    removeFromWishlist,
    addToWishlist,
  } = useWishlist();
  const { login } = useAuth();
  
  const [sessionInfo, setSessionInfo] = useState<GuestSessionInfo | null>(null);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  // Initialize guest session info
  useEffect(() => {
    if (guestSessionId && wishlist.length > 0) {
      const sessionData: GuestSessionInfo = {
        sessionId: guestSessionId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        itemCount: wishlist.length,
      };
      setSessionInfo(sessionData);
    }
  }, [guestSessionId, wishlist]);

  // Generate new guest session
  const handleGenerateSession = async () => {
    setIsGeneratingSession(true);
    try {
      // Generate new session
      initGuestSession();
      
      // Reset session info to trigger re-generation
      setSessionInfo(null);
      
      toast.success('New guest session created');
    } catch (error) {
      console.error('Failed to generate session:', error);
      toast.error('Failed to create guest session');
    } finally {
      setIsGeneratingSession(false);
    }
  };

  // Send wishlist via email
  const handleSendEmail = async () => {
    if (!guestSessionId || !email) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch(
        `/api/v1/wishlist/guest/email?guestSessionId=${guestSessionId}&email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Wishlist sent to your email!');
        setShowEmailModal(false);
        setEmail('');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send wishlist email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Copy session ID to clipboard
  const handleCopySession = async () => {
    if (guestSessionId) {
      try {
        await navigator.clipboard.writeText(guestSessionId);
        setCopiedSession(true);
        setTimeout(() => setCopiedSession(false), 2000);
        toast.success('Session ID copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy session ID');
      }
    }
  };

  // Handle login and merge
  const handleLoginAndMerge = async () => {
    try {
      // This would typically open a login modal
      // For now, we'll just show a message
      toast.success('Please log in to merge your wishlist');
      // In real implementation, you'd open login modal and after successful login:
      // await mergeGuestWishlist();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
    }
  };

  // Export wishlist as JSON
  const handleExportWishlist = () => {
    if (wishlist.length === 0) {
      toast.error('Wishlist is empty');
      return;
    }

    const exportData = {
      sessionId: guestSessionId,
      exportedAt: new Date().toISOString(),
      items: wishlist.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        price: item.product.price,
        addedAt: item.addedAt,
        notes: item.notes,
        priority: item.priority,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wishlist-${guestSessionId?.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Wishlist exported successfully');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!guestSessionId) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Wishlist</h3>
          <p className="text-sm text-gray-600 mb-6">
            Start building your wishlist as a guest
          </p>
          <Button
            onClick={handleGenerateSession}
            disabled={isGeneratingSession}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingSession ? 'animate-spin' : ''}`} />
            {isGeneratingSession ? 'Creating...' : 'Create Guest Session'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guest Wishlist</h3>
              <p className="text-sm text-gray-600">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSession}
            disabled={isGeneratingSession}
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingSession ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Session Info */}
        {sessionInfo && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Session Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Session: {sessionInfo.sessionId.slice(0, 8)}...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySession}
                  className="p-1 h-6"
                >
                  {copiedSession ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-blue-600" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">
                  Expires: {formatDate(sessionInfo.expiresAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 justify-start"
            >
              <Mail className="w-4 h-4" />
              Email Wishlist
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportWishlist}
              className="flex items-center gap-2 justify-start"
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </Button>
            
            <Button
              onClick={handleLoginAndMerge}
              className="flex items-center gap-2 justify-start"
            >
              <User className="w-4 h-4" />
              Sign In & Save
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopySession}
              className="flex items-center gap-2 justify-start"
            >
              <Copy className="w-4 h-4" />
              Copy Session ID
            </Button>
          </div>
        </div>

        {/* Guest Benefits */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Why Create an Account?
          </h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Save your wishlist permanently</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Access across multiple devices</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Get email notifications for price drops</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Share your wishlist with others</span>
            </li>
          </ul>
        </div>

        {/* Wishlist Preview */}
        {wishlist.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Your Wishlist Preview</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wishlist.slice(0, 5).map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={getImageUrl(item.product.imageUrl)}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWishlist(item.productId)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {wishlist.length > 5 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  ...and {wishlist.length - 5} more items
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Wishlist</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Send your wishlist to your email for safekeeping
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSendEmail}
                  disabled={!email || isSendingEmail}
                  className="flex-1 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailModal(false)}
                  disabled={isSendingEmail}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}