'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Something went wrong!
          </CardTitle>
          <CardDescription className="text-gray-600">
            We apologize for the inconvenience. An unexpected error has occurred.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Error details:</p>
              <code className="text-xs text-gray-700 break-all">
                {error.message || 'Unknown error'}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2 flex-1"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button
              onClick={handleGoHome}
              className="flex items-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
