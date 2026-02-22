/**
 * GraphQL Client Configuration
 * 
 * This file sets up Apollo Client for GraphQL operations
 * alongside the existing REST API structure.
 */

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from '../utils/auth';

// Import generated types for type safety
import type {
  Category,
  Cart,
} from './generated/types';

/**
 * HTTP Link for GraphQL API
 */
const resolveGraphqlUri = () => {
  const explicitGraphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (explicitGraphqlUrl) {
    return explicitGraphqlUrl;
  }

  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190/api';
  const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return base.toLowerCase().endsWith('/api') ? `${base}/graphql` : `${base}/api/graphql`;
};

const httpLink = createHttpLink({
  uri: resolveGraphqlUri(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authentication Link for GraphQL requests
 */
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  const authHeaders = token ? { authorization: `Bearer ${token}` } : {};
  return {
    headers: {
      ...headers,
      ...authHeaders,
    },
  };
});

/**
 * GraphQL Client Configuration
 */
export const graphqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          /**
           * Cache products based on filter and pagination parameters
           * API returns offset pagination shape (content/pageInfo), not Relay edges.
           * Avoid custom merge logic that expects `incoming.edges`.
           */
          products: {
            merge: false,
            keyArgs: ['filter', 'pagination'],
          },
          /**
           * Cache categories to avoid repeated category fetches
           */
          categories: {
            merge(existing: Category[] | undefined, incoming: Category[]) {
              return incoming
            },
          },
          /**
           * Cache cart items for better performance
           */
          cart: {
            merge(existing: Cart | undefined, incoming: Cart) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

/**
 * Export the GraphQL client for use in hooks and components
 */
export default graphqlClient;
