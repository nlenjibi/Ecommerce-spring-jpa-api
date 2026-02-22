import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: Date; output: Date; }
  JSON: { input: Record<string, any>; output: Record<string, any>; }
};

export type AddToCartInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  variantId?: InputMaybe<Scalars['ID']['input']>;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
};

export type Cart = {
  __typename?: 'Cart';
  createdAt: Scalars['Date']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  items: Array<CartItem>;
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  id: Scalars['ID']['output'];
  price: Scalars['Float']['output'];
  product: Product;
  quantity: Scalars['Int']['output'];
  total: Scalars['Float']['output'];
  variant?: Maybe<ProductVariant>;
};

export type Category = {
  __typename?: 'Category';
  children: Array<Category>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  productsCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
};

export type CreateProductInput = {
  categoryId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  images: Array<ProductImageInput>;
  inventory: ProductInventoryInput;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  variants: Array<ProductVariantInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart: Cart;
  clearCart: Cart;
  createProduct: Product;
  deleteProduct: Scalars['Boolean']['output'];
  removeCartItem: Cart;
  updateCartItem: Cart;
  updateProduct: Product;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveCartItemArgs = {
  input: RemoveCartItemInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
};

export type Order = {
  __typename?: 'Order';
  billingAddress: Address;
  createdAt: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  items: Array<OrderItem>;
  orderNumber: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  status: OrderStatus;
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
  updatedAt: Scalars['Date']['output'];
};

export type OrderItem = {
  __typename?: 'OrderItem';
  id: Scalars['ID']['output'];
  price: Scalars['Float']['output'];
  product: Product;
  quantity: Scalars['Int']['output'];
  total: Scalars['Float']['output'];
  variant?: Maybe<ProductVariant>;
};

export type OrderStatus =
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'PENDING'
  | 'PROCESSING'
  | 'REFUNDED'
  | 'SHIPPED'
  | '%future added value';

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaymentStatus =
  | 'COMPLETED'
  | 'FAILED'
  | 'PENDING'
  | 'PROCESSING'
  | 'REFUNDED'
  | '%future added value';

export type PriceRangeFilter = {
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

export type Product = {
  __typename?: 'Product';
  category?: Maybe<Category>;
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discountPrice?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  images: Array<ProductImage>;
  inventory: ProductInventory;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  updatedAt: Scalars['Date']['output'];
  variants: Array<ProductVariant>;
};

export type ProductConnection = {
  __typename?: 'ProductConnection';
  edges: Array<ProductEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProductEdge = {
  __typename?: 'ProductEdge';
  cursor: Scalars['String']['output'];
  node: Product;
};

export type ProductFilter = {
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  inStock?: InputMaybe<Scalars['Boolean']['input']>;
  priceRange?: InputMaybe<PriceRangeFilter>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ProductImage = {
  __typename?: 'ProductImage';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  position: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type ProductImageInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
  url: Scalars['String']['input'];
};

export type ProductInventory = {
  __typename?: 'ProductInventory';
  available: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lowStockThreshold: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
  reserved: Scalars['Int']['output'];
};

export type ProductInventoryInput = {
  lowStockThreshold: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};

export type ProductSort = {
  direction: SortDirection;
  field: ProductSortField;
};

export type ProductSortField =
  | 'CREATED_AT'
  | 'NAME'
  | 'POPULARITY'
  | 'PRICE'
  | 'UPDATED_AT'
  | '%future added value';

export type ProductVariant = {
  __typename?: 'ProductVariant';
  attributes: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  inventory: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  sku: Scalars['String']['output'];
};

export type ProductVariantInput = {
  attributes: Scalars['JSON']['input'];
  inventory: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  sku: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
  categories: Array<Category>;
  category?: Maybe<Category>;
  categoryBySlug?: Maybe<Category>;
  order?: Maybe<Order>;
  orders: Array<Order>;
  product?: Maybe<Product>;
  products: ProductConnection;
};


export type QueryCategoryBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductSort>;
};

export type RemoveCartItemInput = {
  id: Scalars['ID']['input'];
};

export type SortDirection =
  | 'ASC'
  | 'DESC'
  | '%future added value';

export type Subscription = {
  __typename?: 'Subscription';
  cartUpdated: Cart;
  orderStatusChanged: Order;
};


export type SubscriptionOrderStatusChangedArgs = {
  orderId: Scalars['ID']['input'];
};

export type UpdateCartItemInput = {
  id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type UpdateProductInput = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<ProductImageInput>>;
  inventory?: InputMaybe<ProductInventoryInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  variants?: InputMaybe<Array<ProductVariantInput>>;
};

export type GetProductsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductFilter>;
  sort?: InputMaybe<ProductSort>;
}>;


export type GetProductsQuery = { __typename?: 'Query', products: { __typename?: 'ProductConnection', totalCount: number, edges: Array<{ __typename?: 'ProductEdge', cursor: string, node: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, createdAt: Date, updatedAt: Date, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }>, variants: Array<{ __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, inventory: number, attributes: Record<string, any> }>, category?: { __typename?: 'Category', id: string, name: string, slug: string } | null, inventory: { __typename?: 'ProductInventory', quantity: number, reserved: number, available: number, lowStockThreshold: number } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetProductQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetProductQuery = { __typename?: 'Query', product?: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, createdAt: Date, updatedAt: Date, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }>, variants: Array<{ __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, inventory: number, attributes: Record<string, any> }>, category?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, image?: string | null } | null, inventory: { __typename?: 'ProductInventory', quantity: number, reserved: number, available: number, lowStockThreshold: number } } | null };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryResponseDto', content: Array<{ __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null, parentId?: string | null, children: Array<{ __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null }>, productCount?: number | null }>, pageInfo: { __typename?: 'PageInfo', page: number, size: number, totalElements: number, totalPages: number, isFirst?: boolean | null, isLast?: boolean | null, hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: string | null, endCursor?: string | null } } };

export type GetCategoryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCategoryQuery = { __typename?: 'Query', category?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null, parentId?: string | null, productCount?: number | null, children: Array<{ __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null }> } | null };

export type GetCategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetCategoryBySlugQuery = { __typename?: 'Query', categoryBySlug?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null, parentId?: string | null, productCount?: number | null, children: Array<{ __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null }> } | null };

export type GetCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartQuery = { __typename?: 'Query', cart?: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } | null };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { __typename?: 'Mutation', updateCartItem: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };

export type RemoveCartItemMutationVariables = Exact<{
  input: RemoveCartItemInput;
}>;


export type RemoveCartItemMutation = { __typename?: 'Mutation', removeCartItem: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };

export type GetOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrdersQuery = { __typename?: 'Query', orders: Array<{ __typename?: 'Order', id: string, orderNumber: string, status: OrderStatus, subtotal: number, total: number, paymentStatus: PaymentStatus, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, attributes: Record<string, any> } | null }> }> };

export type GetOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrderQuery = { __typename?: 'Query', order?: { __typename?: 'Order', id: string, orderNumber: string, status: OrderStatus, subtotal: number, total: number, paymentStatus: PaymentStatus, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }>, shippingAddress: { __typename?: 'Address', street: string, city: string, state: string, postalCode: string, country: string }, billingAddress: { __typename?: 'Address', street: string, city: string, state: string, postalCode: string, country: string } } | null };

export type CartUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CartUpdatedSubscription = { __typename?: 'Subscription', cartUpdated: { __typename?: 'Cart', id: string, subtotal: number, total: number, currency: string, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'CartItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };

export type OrderStatusChangedSubscriptionVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type OrderStatusChangedSubscription = { __typename?: 'Subscription', orderStatusChanged: { __typename?: 'Order', id: string, orderNumber: string, status: OrderStatus, subtotal: number, total: number, paymentStatus: PaymentStatus, createdAt: Date, updatedAt: Date, items: Array<{ __typename?: 'OrderItem', id: string, quantity: number, price: number, total: number, product: { __typename?: 'Product', id: string, name: string, description?: string | null, price: number, discountPrice?: number | null, images: Array<{ __typename?: 'ProductImage', id: string, url: string, alt?: string | null, position: number }> }, variant?: { __typename?: 'ProductVariant', id: string, name: string, sku: string, price: number, attributes: Record<string, any> } | null }> } };


export const GetProductsDocument = gql`
    query GetProducts($first: Int = 20, $after: String, $filter: ProductFilter, $sort: ProductSort) {
  products(first: $first, after: $after, filter: $filter, sort: $sort) {
    edges {
      node {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
        variants {
          id
          name
          sku
          price
          inventory
          attributes
        }
        category {
          id
          name
          slug
        }
        inventory {
          quantity
          reserved
          available
          lowStockThreshold
        }
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

/**
 * __useGetProductsQuery__
 *
 * To run a query within a React component, call `useGetProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      filter: // value for 'filter'
 *      sort: // value for 'sort'
 *   },
 * });
 */
export function useGetProductsQuery(baseOptions?: Apollo.QueryHookOptions<GetProductsQuery, GetProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProductsQuery, GetProductsQueryVariables>(GetProductsDocument, options);
      }
export function useGetProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProductsQuery, GetProductsQueryVariables>(GetProductsDocument, options);
        }
// @ts-ignore
export function useGetProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>): Apollo.UseSuspenseQueryResult<GetProductsQuery, GetProductsQueryVariables>;
export function useGetProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>): Apollo.UseSuspenseQueryResult<GetProductsQuery | undefined, GetProductsQueryVariables>;
export function useGetProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProductsQuery, GetProductsQueryVariables>(GetProductsDocument, options);
        }
export type GetProductsQueryHookResult = ReturnType<typeof useGetProductsQuery>;
export type GetProductsLazyQueryHookResult = ReturnType<typeof useGetProductsLazyQuery>;
export type GetProductsSuspenseQueryHookResult = ReturnType<typeof useGetProductsSuspenseQuery>;
export type GetProductsQueryResult = Apollo.QueryResult<GetProductsQuery, GetProductsQueryVariables>;
export const GetProductDocument = gql`
    query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    description
    price
    discountPrice
    images {
      id
      url
      alt
      position
    }
    variants {
      id
      name
      sku
      price
      inventory
      attributes
    }
    category {
      id
      name
      slug
      description
      image
    }
    inventory {
      quantity
      reserved
      available
      lowStockThreshold
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetProductQuery__
 *
 * To run a query within a React component, call `useGetProductQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProductQuery(baseOptions: Apollo.QueryHookOptions<GetProductQuery, GetProductQueryVariables> & ({ variables: GetProductQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProductQuery, GetProductQueryVariables>(GetProductDocument, options);
      }
export function useGetProductLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProductQuery, GetProductQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProductQuery, GetProductQueryVariables>(GetProductDocument, options);
        }
// @ts-ignore
export function useGetProductSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProductQuery, GetProductQueryVariables>): Apollo.UseSuspenseQueryResult<GetProductQuery, GetProductQueryVariables>;
export function useGetProductSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProductQuery, GetProductQueryVariables>): Apollo.UseSuspenseQueryResult<GetProductQuery | undefined, GetProductQueryVariables>;
export function useGetProductSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProductQuery, GetProductQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProductQuery, GetProductQueryVariables>(GetProductDocument, options);
        }
export type GetProductQueryHookResult = ReturnType<typeof useGetProductQuery>;
export type GetProductLazyQueryHookResult = ReturnType<typeof useGetProductLazyQuery>;
export type GetProductSuspenseQueryHookResult = ReturnType<typeof useGetProductSuspenseQuery>;
export type GetProductQueryResult = Apollo.QueryResult<GetProductQuery, GetProductQueryVariables>;
export const GetCategoriesDocument = gql`
    query GetCategories {
  categories {
    content {
      id
      name
      slug
      description
      imageUrl
      parentId
      children {
        id
        name
        slug
        description
        imageUrl
      }
      productCount
    }
    pageInfo {
      page
      size
      totalElements
      totalPages
      isFirst
      isLast
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
      }
export function useGetCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
// @ts-ignore
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery | undefined, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
export type GetCategoriesQueryHookResult = ReturnType<typeof useGetCategoriesQuery>;
export type GetCategoriesLazyQueryHookResult = ReturnType<typeof useGetCategoriesLazyQuery>;
export type GetCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetCategoriesSuspenseQuery>;
export type GetCategoriesQueryResult = Apollo.QueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetCategoryDocument = gql`
    query GetCategory($id: ID!) {
  category(id: $id) {
    id
    name
    slug
    description
    imageUrl
    parentId
    children {
      id
      name
      slug
      description
      imageUrl
    }
    productCount
  }
}
    `;

/**
 * __useGetCategoryQuery__
 *
 * To run a query within a React component, call `useGetCategoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCategoryQuery(baseOptions: Apollo.QueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables> & ({ variables: GetCategoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCategoryQuery, GetCategoryQueryVariables>(GetCategoryDocument, options);
      }
export function useGetCategoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCategoryQuery, GetCategoryQueryVariables>(GetCategoryDocument, options);
        }
// @ts-ignore
export function useGetCategorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoryQuery, GetCategoryQueryVariables>;
export function useGetCategorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoryQuery | undefined, GetCategoryQueryVariables>;
export function useGetCategorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCategoryQuery, GetCategoryQueryVariables>(GetCategoryDocument, options);
        }
export type GetCategoryQueryHookResult = ReturnType<typeof useGetCategoryQuery>;
export type GetCategoryLazyQueryHookResult = ReturnType<typeof useGetCategoryLazyQuery>;
export type GetCategorySuspenseQueryHookResult = ReturnType<typeof useGetCategorySuspenseQuery>;
export type GetCategoryQueryResult = Apollo.QueryResult<GetCategoryQuery, GetCategoryQueryVariables>;
export const GetCategoryBySlugDocument = gql`
    query GetCategoryBySlug($slug: String!) {
  categoryBySlug(slug: $slug) {
    id
    name
    slug
    description
    imageUrl
    parentId
    children {
      id
      name
      slug
      description
      imageUrl
    }
    productCount
  }
}
    `;

/**
 * __useGetCategoryBySlugQuery__
 *
 * To run a query within a React component, call `useGetCategoryBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetCategoryBySlugQuery(baseOptions: Apollo.QueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables> & ({ variables: GetCategoryBySlugQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(GetCategoryBySlugDocument, options);
      }
export function useGetCategoryBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(GetCategoryBySlugDocument, options);
        }
// @ts-ignore
export function useGetCategoryBySlugSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>;
export function useGetCategoryBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoryBySlugQuery | undefined, GetCategoryBySlugQueryVariables>;
export function useGetCategoryBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(GetCategoryBySlugDocument, options);
        }
export type GetCategoryBySlugQueryHookResult = ReturnType<typeof useGetCategoryBySlugQuery>;
export type GetCategoryBySlugLazyQueryHookResult = ReturnType<typeof useGetCategoryBySlugLazyQuery>;
export type GetCategoryBySlugSuspenseQueryHookResult = ReturnType<typeof useGetCategoryBySlugSuspenseQuery>;
export type GetCategoryBySlugQueryResult = Apollo.QueryResult<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>;
export const GetCartDocument = gql`
    query GetCart {
  cart {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetCartQuery__
 *
 * To run a query within a React component, call `useGetCartQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCartQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCartQuery(baseOptions?: Apollo.QueryHookOptions<GetCartQuery, GetCartQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
      }
export function useGetCartLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCartQuery, GetCartQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
        }
// @ts-ignore
export function useGetCartSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCartQuery, GetCartQueryVariables>): Apollo.UseSuspenseQueryResult<GetCartQuery, GetCartQueryVariables>;
export function useGetCartSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCartQuery, GetCartQueryVariables>): Apollo.UseSuspenseQueryResult<GetCartQuery | undefined, GetCartQueryVariables>;
export function useGetCartSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCartQuery, GetCartQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
        }
export type GetCartQueryHookResult = ReturnType<typeof useGetCartQuery>;
export type GetCartLazyQueryHookResult = ReturnType<typeof useGetCartLazyQuery>;
export type GetCartSuspenseQueryHookResult = ReturnType<typeof useGetCartSuspenseQuery>;
export type GetCartQueryResult = Apollo.QueryResult<GetCartQuery, GetCartQueryVariables>;
export const AddToCartDocument = gql`
    mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;
export type AddToCartMutationFn = Apollo.MutationFunction<AddToCartMutation, AddToCartMutationVariables>;

/**
 * __useAddToCartMutation__
 *
 * To run a mutation, you first call `useAddToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToCartMutation, { data, loading, error }] = useAddToCartMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddToCartMutation(baseOptions?: Apollo.MutationHookOptions<AddToCartMutation, AddToCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddToCartMutation, AddToCartMutationVariables>(AddToCartDocument, options);
      }
export type AddToCartMutationHookResult = ReturnType<typeof useAddToCartMutation>;
export type AddToCartMutationResult = Apollo.MutationResult<AddToCartMutation>;
export type AddToCartMutationOptions = Apollo.BaseMutationOptions<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = gql`
    mutation UpdateCartItem($input: UpdateCartItemInput!) {
  updateCartItem(input: $input) {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;
export type UpdateCartItemMutationFn = Apollo.MutationFunction<UpdateCartItemMutation, UpdateCartItemMutationVariables>;

/**
 * __useUpdateCartItemMutation__
 *
 * To run a mutation, you first call `useUpdateCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCartItemMutation, { data, loading, error }] = useUpdateCartItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCartItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCartItemMutation, UpdateCartItemMutationVariables>(UpdateCartItemDocument, options);
      }
export type UpdateCartItemMutationHookResult = ReturnType<typeof useUpdateCartItemMutation>;
export type UpdateCartItemMutationResult = Apollo.MutationResult<UpdateCartItemMutation>;
export type UpdateCartItemMutationOptions = Apollo.BaseMutationOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveCartItemDocument = gql`
    mutation RemoveCartItem($input: RemoveCartItemInput!) {
  removeCartItem(input: $input) {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;
export type RemoveCartItemMutationFn = Apollo.MutationFunction<RemoveCartItemMutation, RemoveCartItemMutationVariables>;

/**
 * __useRemoveCartItemMutation__
 *
 * To run a mutation, you first call `useRemoveCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCartItemMutation, { data, loading, error }] = useRemoveCartItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveCartItemMutation(baseOptions?: Apollo.MutationHookOptions<RemoveCartItemMutation, RemoveCartItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveCartItemMutation, RemoveCartItemMutationVariables>(RemoveCartItemDocument, options);
      }
export type RemoveCartItemMutationHookResult = ReturnType<typeof useRemoveCartItemMutation>;
export type RemoveCartItemMutationResult = Apollo.MutationResult<RemoveCartItemMutation>;
export type RemoveCartItemMutationOptions = Apollo.BaseMutationOptions<RemoveCartItemMutation, RemoveCartItemMutationVariables>;
export const ClearCartDocument = gql`
    mutation ClearCart {
  clearCart {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;
export type ClearCartMutationFn = Apollo.MutationFunction<ClearCartMutation, ClearCartMutationVariables>;

/**
 * __useClearCartMutation__
 *
 * To run a mutation, you first call `useClearCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearCartMutation, { data, loading, error }] = useClearCartMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearCartMutation(baseOptions?: Apollo.MutationHookOptions<ClearCartMutation, ClearCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ClearCartMutation, ClearCartMutationVariables>(ClearCartDocument, options);
      }
export type ClearCartMutationHookResult = ReturnType<typeof useClearCartMutation>;
export type ClearCartMutationResult = Apollo.MutationResult<ClearCartMutation>;
export type ClearCartMutationOptions = Apollo.BaseMutationOptions<ClearCartMutation, ClearCartMutationVariables>;
export const GetOrdersDocument = gql`
    query GetOrders {
  orders {
    id
    orderNumber
    status
    subtotal
    total
    paymentStatus
    createdAt
    updatedAt
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        attributes
      }
    }
  }
}
    `;

/**
 * __useGetOrdersQuery__
 *
 * To run a query within a React component, call `useGetOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrdersQuery(baseOptions?: Apollo.QueryHookOptions<GetOrdersQuery, GetOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrdersQuery, GetOrdersQueryVariables>(GetOrdersDocument, options);
      }
export function useGetOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrdersQuery, GetOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrdersQuery, GetOrdersQueryVariables>(GetOrdersDocument, options);
        }
// @ts-ignore
export function useGetOrdersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrdersQuery, GetOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetOrdersQuery, GetOrdersQueryVariables>;
export function useGetOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrdersQuery, GetOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetOrdersQuery | undefined, GetOrdersQueryVariables>;
export function useGetOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrdersQuery, GetOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrdersQuery, GetOrdersQueryVariables>(GetOrdersDocument, options);
        }
export type GetOrdersQueryHookResult = ReturnType<typeof useGetOrdersQuery>;
export type GetOrdersLazyQueryHookResult = ReturnType<typeof useGetOrdersLazyQuery>;
export type GetOrdersSuspenseQueryHookResult = ReturnType<typeof useGetOrdersSuspenseQuery>;
export type GetOrdersQueryResult = Apollo.QueryResult<GetOrdersQuery, GetOrdersQueryVariables>;
export const GetOrderDocument = gql`
    query GetOrder($id: ID!) {
  order(id: $id) {
    id
    orderNumber
    status
    subtotal
    total
    paymentStatus
    createdAt
    updatedAt
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    shippingAddress {
      street
      city
      state
      postalCode
      country
    }
    billingAddress {
      street
      city
      state
      postalCode
      country
    }
  }
}
    `;

/**
 * __useGetOrderQuery__
 *
 * To run a query within a React component, call `useGetOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrderQuery(baseOptions: Apollo.QueryHookOptions<GetOrderQuery, GetOrderQueryVariables> & ({ variables: GetOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
      }
export function useGetOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
        }
// @ts-ignore
export function useGetOrderSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetOrderQuery, GetOrderQueryVariables>;
export function useGetOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetOrderQuery | undefined, GetOrderQueryVariables>;
export function useGetOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
        }
export type GetOrderQueryHookResult = ReturnType<typeof useGetOrderQuery>;
export type GetOrderLazyQueryHookResult = ReturnType<typeof useGetOrderLazyQuery>;
export type GetOrderSuspenseQueryHookResult = ReturnType<typeof useGetOrderSuspenseQuery>;
export type GetOrderQueryResult = Apollo.QueryResult<GetOrderQuery, GetOrderQueryVariables>;
export const CartUpdatedDocument = gql`
    subscription CartUpdated {
  cartUpdated {
    id
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
    subtotal
    total
    currency
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useCartUpdatedSubscription__
 *
 * To run a query within a React component, call `useCartUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCartUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCartUpdatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useCartUpdatedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<CartUpdatedSubscription, CartUpdatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<CartUpdatedSubscription, CartUpdatedSubscriptionVariables>(CartUpdatedDocument, options);
      }
export type CartUpdatedSubscriptionHookResult = ReturnType<typeof useCartUpdatedSubscription>;
export type CartUpdatedSubscriptionResult = Apollo.SubscriptionResult<CartUpdatedSubscription>;
export const OrderStatusChangedDocument = gql`
    subscription OrderStatusChanged($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) {
    id
    orderNumber
    status
    subtotal
    total
    paymentStatus
    createdAt
    updatedAt
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        description
        price
        discountPrice
        images {
          id
          url
          alt
          position
        }
      }
      variant {
        id
        name
        sku
        price
        attributes
      }
    }
  }
}
    `;

/**
 * __useOrderStatusChangedSubscription__
 *
 * To run a query within a React component, call `useOrderStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderStatusChangedSubscription({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useOrderStatusChangedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderStatusChangedSubscription, OrderStatusChangedSubscriptionVariables> & ({ variables: OrderStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderStatusChangedSubscription, OrderStatusChangedSubscriptionVariables>(OrderStatusChangedDocument, options);
      }
export type OrderStatusChangedSubscriptionHookResult = ReturnType<typeof useOrderStatusChangedSubscription>;
export type OrderStatusChangedSubscriptionResult = Apollo.SubscriptionResult<OrderStatusChangedSubscription>;
