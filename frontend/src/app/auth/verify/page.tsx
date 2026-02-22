'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'invalid'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('invalid');
        setIsLoading(false);
        return;
      }

      try {
        // Simulate API call - replace with actual email verification API
        await new Promise(resolve => setTimeout(resolve, 2000));
        // await authApi.verifyEmail(token);

        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Verification Link</h1>
            <p className="text-gray-600 mb-6">
              This verification link is invalid or has expired.
              Please check your email for the correct link or request a new one.
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/resend-verification"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Request New Verification Email
              </Link>
              <Link
                href="/auth/login"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              We encountered an issue while verifying your email.
              Please try again or contact support if the problem persists.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <Link
                href="/contact"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email address has been successfully verified.
            You can now access all features of your account.
          </p>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
              </Link>
          </div>

          {/* Additional Benefits */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">What's Next?</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Receive order confirmations and updates</li>
              <li>• Get exclusive deals and promotions</li>
              <li>• Access your order history and tracking</li>
              <li>• Save your favorite products</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
