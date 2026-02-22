import { gql } from '@apollo/client';

/**
 * GraphQL Queries for Product Data Fetching
 * 
 * These queries follow the REST/GraphQL API Strategy:
 * - GraphQL is used for all data fetching and queries
 * - REST is used for commands (mutations) only
 * 
 * All product listing, filtering, searching, and read operations
 * should use these GraphQL queries.
 */

// ==================== Basic Product Queries ====================

export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput, $pagination: PageInput) {
    products(filter: $filter, pagination: $pagination) {
      content {
        id
        name
        slug
        description
        price
        discountPrice
        effectivePrice
        discountPercentage
        stockQuantity
        availableQuantity
        inventoryStatus
        imageUrl
        thumbnailUrl
        featured
        isNew
        isBestseller
        ratingAverage
        ratingCount
        viewCount
        salesCount
        category {
          id
          name
          slug
        }
        images {
          id
          imageUrl
          altText
          isPrimary
        }
        tags
        createdAt
        updatedAt
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
        isFirst
        isLast
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      sku
      price
      discountPrice
      costPrice
      effectivePrice
      discountPercentage
      stockQuantity
      reservedQuantity
      availableQuantity
      lowStockThreshold
      reorderPoint
      inventoryStatus
      trackInventory
      allowBackorder
      imageUrl
      thumbnailUrl
      additionalImages
      featured
      isNew
      isBestseller
      viewCount
      salesCount
      ratingAverage
      ratingCount
      metaTitle
      metaDescription
      tags
      category {
        id
        name
        slug
        description
        imageUrl
      }
      images {
        id
        imageUrl
        altText
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      slug
      description
      sku
      price
      discountPrice
      effectivePrice
      stockQuantity
      availableQuantity
      inventoryStatus
      imageUrl
      thumbnailUrl
      featured
      isNew
      isBestseller
      ratingAverage
      ratingCount
      viewCount
      salesCount
      metaTitle
      metaDescription
      tags
      category {
        id
        name
        slug
        description
      }
      images {
        id
        imageUrl
        altText
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

// ==================== Product Filtering & Search Queries ====================

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $pagination: PageInput) {
    productsByCategory(categoryId: $categoryId, pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        ratingCount
        inventoryStatus
        featured
        isNew
        isBestseller
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
      
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY_NAME = gql`
  query GetProductsByCategoryName($categoryName: String!, $pagination: PageInput) {
    productsByCategoryName(categoryName: $categoryName, pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        ratingCount
        inventoryStatus
        featured
        isNew
        isBestseller
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_PRODUCTS_BY_PRICE_RANGE = gql`
  query GetProductsByPriceRange($minPrice: BigDecimal!, $maxPrice: BigDecimal!, $pagination: PageInput) {
    productsByPriceRange(minPrice: $minPrice, maxPrice: $maxPrice, pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        discountPercentage
        imageUrl
        ratingAverage
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($keyword: String!, $pagination: PageInput) {
    searchProducts(keyword: $keyword, pagination: $pagination) {
      content {
        id
        name
        slug
        description
        price
        discountPrice
        effectivePrice
        imageUrl
        thumbnailUrl
        ratingAverage
        ratingCount
        inventoryStatus
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

// ==================== Marketing & Discovery Queries ====================

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($pagination: PageInput) {
    featuredProducts(pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        thumbnailUrl
        ratingAverage
        ratingCount
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_NEW_PRODUCTS = gql`
  query GetNewProducts($pagination: PageInput) {
    newProducts(pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        ratingCount
        isNew
        createdAt
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_DISCOUNTED_PRODUCTS = gql`
  query GetDiscountedProducts($pagination: PageInput) {
    discountedProducts(pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        discountPercentage
        imageUrl
        ratingAverage
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_BESTSELLER_PRODUCTS = gql`
  query GetBestsellerProducts($pagination: PageInput) {
    bestsellerProducts(pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        salesCount
        ratingAverage
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
        isFirst
        isLast
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_TOP_RATED_PRODUCTS = gql`
  query GetTopRatedProducts($pagination: PageInput) {
    topRatedProducts(pagination: $pagination) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        ratingCount
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
        isFirst
        isLast
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_TRENDING_PRODUCTS = gql`
  query GetTrendingProducts($categoryId: ID, $limit: Int = 10) {
    trendingProducts(categoryId: $categoryId, limit: $limit) {
      id
      name
      slug
      price
      discountPrice
      effectivePrice
      imageUrl
      salesCount
      viewCount
      ratingAverage
      category {
        id
        name
        slug
      }
    }
  }
`;

// ==================== Inventory Management Queries ====================

export const GET_PRODUCTS_BY_INVENTORY_STATUS = gql`
  query GetProductsByInventoryStatus($status: InventoryStatus!, $pagination: PageInput) {
    productsByInventoryStatus(status: $status, pagination: $pagination) {
      content {
        id
        name
        slug
        price
        stockQuantity
        availableQuantity
        reservedQuantity
        inventoryStatus
        lowStockThreshold
        reorderPoint
        imageUrl
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_PRODUCTS_NEEDING_REORDER = gql`
  query GetProductsNeedingReorder($pagination: PageInput) {
    productsNeedingReorder(pagination: $pagination) {
      content {
        id
        name
        slug
        sku
        price
        stockQuantity
        availableQuantity
        reorderPoint
        reorderQuantity
        inventoryStatus
        imageUrl
        category {
          id
          name
          slug
        }
      }
      pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

export const GET_LOW_STOCK_PRODUCTS = gql`
  query GetLowStockProducts {
    lowStockProducts {
      id
      name
      slug
      sku
      stockQuantity
      availableQuantity
      lowStockThreshold
      inventoryStatus
      imageUrl
      category {
        id
        name
        slug
      }
    }
  }
`;

export const GET_OUT_OF_STOCK_PRODUCTS = gql`
  query GetOutOfStockProducts {
    outOfStockProducts {
      id
      name
      slug
      sku
      stockQuantity
      availableQuantity
      inventoryStatus
      imageUrl
      category {
        id
        name
        slug
      }
    }
  }
`;

// ==================== Statistics & Analytics Queries ====================

export const GET_PRODUCT_STATISTICS = gql`
  query GetProductStatistics {
    productStatistics {
      totalProducts
      activeProducts
      featuredProducts
      outOfStockProducts
      lowStockProducts
      averagePrice
      totalInventoryValue
      productsByCategory {
        category
        count
      }
      productsByStatus {
        status
        count
      }
      totalViews
      totalSales
    }
  }
`;

// ==================== Category Queries ====================

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      content {
        id
        name
        slug
        description
        imageUrl
        productCount
        isActive
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
        isFirst
        isLast
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      imageUrl
      productCount
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
      description
      imageUrl
      productCount
      isActive
    }
  }
`;

// ==================== Aggregated Homepage Query ====================

export const GET_HOMEPAGE_DATA = gql`
  query GetHomepageData {
    featuredProducts(pagination: { page: 0, size: 6 }) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        category {
          id
          name
          slug
        }
      }
    }
    newProducts: newProducts(pagination: { page: 0, size: 6 }) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
        isNew
        createdAt
        category {
          id
          name
          slug
        }
      }
    }
    trendingProducts(limit: 6) {
      id
      name
      slug
      price
      discountPrice
      effectivePrice
      imageUrl
      ratingAverage
      salesCount
      category {
        id
        name
        slug
      }
    }
    discountedProducts: discountedProducts(pagination: { page: 0, size: 6 }) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        discountPercentage
        imageUrl
        category {
          id
          name
          slug
        }
      }
    }
    categories {
      content {
        id
        name
        slug
        imageUrl
        productCount
      }
    }
  }
`;

// ==================== Advanced Product Catalog Query ====================

export const GET_PRODUCT_CATALOG = gql`
  query GetProductCatalog(
    $filter: ProductFilterInput
    $sortBy: String
    $sortDirection: SortDirection
    $page: Int = 0
    $size: Int = 20
  ) {
    products(
      filter: $filter
      pagination: {
        page: $page
        size: $size
        sortBy: $sortBy
        direction: $sortDirection
      }
    ) {
      content {
        id
        name
        slug
        description
        price
        discountPrice
        effectivePrice
        discountPercentage
        stockQuantity
        availableQuantity
        inventoryStatus
        imageUrl
        thumbnailUrl
        featured
        isNew
        isBestseller
        ratingAverage
        ratingCount
        viewCount
        salesCount
        category {
          id
          name
          slug
        }
        images {
          id
          imageUrl
          altText
          isPrimary
        }
        tags
      }
    pageInfo {
        page
        size
        totalElements      
        totalPages     
        isFirst       
        isLast       
        hasNext     
        hasPrevious      
      }
    }
  }
`;

// ==================== Related Products Query ====================

export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($categoryId: ID!, $excludeProductId: ID!, $limit: Int = 4) {
    productsByCategory(categoryId: $categoryId, pagination: { page: 0, size: $limit }) {
      content {
        id
        name
        slug
        price
        discountPrice
        effectivePrice
        imageUrl
        ratingAverage
      }
    }
  }
`;

