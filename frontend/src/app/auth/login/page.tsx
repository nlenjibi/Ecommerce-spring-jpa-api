'use client';

/**
 * Login Page
 * 
 * Following REST/GraphQL API Strategy:
 * - REST is used for authentication commands (login)
 * - GraphQL is NOT used for authentication (as per strategy)
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import toast from 'react-hot-toast';
import { authUtils } from '@/lib/api/endpoints/auth.api';
import { getApiErrorMessage } from '@/lib/utils/api-error';

/**
 * Returns the post-login destination by role.
 * - admin   → admin dashboard
 * - seller  → seller dashboard
 * - customer / user → home page (shoppers don't need to see their dashboard on login)
 */
const getDefaultRouteByRole = (role?: string): string => {
  const r = (role || '').toLowerCase();
  if (r === 'admin') return '/dashboard/admin';
  if (r === 'seller') return '/dashboard/seller';
  return '/'; // customers go home
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Use REST API for login (following API strategy)
      await login(email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      toast.success('Welcome back!');
      const loggedInUser = authUtils.getUser();
      const role = (loggedInUser as any)?.role;

      // If middleware set a callbackUrl (e.g. user was going to /shop/checkout),
      // send them there after login instead of the default route.
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl');
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
        return;
      }

      router.push(getDefaultRouteByRole(role));
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error, 'Login failed. Please check your credentials.');
      setErrors({
        general: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              required
              disabled={isLoading}
              icon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <div className="relative">
              <FormField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
                disabled={isLoading}
                icon={<Lock className="w-4 h-4 text-gray-400" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Quick Login Buttons for Testing */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">Quick Login (Testing)</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setEmail('admin@gmail.com');
                    setPassword('12345678');
                  }}
                  disabled={isLoading}
                >
                  Admin
                </Button>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Create account
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
