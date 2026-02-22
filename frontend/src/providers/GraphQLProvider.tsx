/**
 * GraphQL Provider Component
 * 
 * Wraps the application with Apollo Client Provider
 * for GraphQL operations and caching.
 */

'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { graphqlClient } from '../lib/graphql/client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps the app with GraphQL client
 */
export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({ children }) => {
  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
};

/**
 * Export as default for convenience
 */
export default GraphQLProvider;