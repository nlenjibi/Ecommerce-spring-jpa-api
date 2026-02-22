'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ApolloProvider } from '@apollo/client/react';
import graphqlClient from '@/lib/graphql/client';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AddressProvider } from '@/context/AddressContext';
import { DeliveryProvider } from '@/context/DeliveryContext';
import { SocialLinksProvider, LiveSupportProvider } from '@/context/SocialLinksContext';
import { AppDownloadLinksProvider } from '@/context/AppDownloadLinksContext';
import { CartInitializer } from '@/components/features/cart/CartInitializer';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ApolloProvider client={graphqlClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <CartInitializer />
            <WishlistProvider>
              {/* <AddressProvider> */}
                {/* <DeliveryProvider> */}
                  <SocialLinksProvider>
                    <LiveSupportProvider>
                      <AppDownloadLinksProvider>
                        {children}
                        <Toaster
                          position="top-right"
                          toastOptions={{
                            duration: 3000,
                            style: {
                              background: '#333',
                              color: '#fff',
                            },
                            success: {
                              iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                              },
                            },
                            error: {
                              iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                              },
                            },
                          }}
                        />
                      </AppDownloadLinksProvider>
                    </LiveSupportProvider>
                  </SocialLinksProvider>
                {/* </DeliveryProvider> */}
              {/* </AddressProvider> */}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
