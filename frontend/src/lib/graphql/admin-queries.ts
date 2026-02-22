import { gql } from '@apollo/client';

/**
 * Admin GraphQL Queries
 * 
 * These queries are used for admin data fetching operations.
 * Following the REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations)
 */

// ==================== Dashboard Queries ====================

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    adminDashboard {
      totalRevenue
      totalOrders
      totalProducts
      totalUsers
      pendingOrders
      activeUsers
      lowStockProducts
    }
  }
`;

// ==================== Product Management Queries ====================

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts($filter: ProductFilterInput, $pagination: PageInput) {
    products(filter: $filter, pagination: $pagination) {
      content {
        id
        name
        slug
        sku
        price
        discountPrice
        effectivePrice
        costPrice
        stockQuantity
        availableQuantity
        reservedQuantity
        inventoryStatus
        category {
          id
          name
        }
        imageUrl
        thumbnailUrl
        featured
        isNew
        ratingAverage
        ratingCount
        viewCount
        salesCount
        createdAt
        updatedAt
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
      }
    }
  }
`;

export const GET_ADMIN_PRODUCT_BY_ID = gql`
  query GetAdminProduct($id: ID!) {
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
      stockQuantity
      reservedQuantity
      availableQuantity
      lowStockThreshold
      reorderPoint
      reorderQuantity
      maxStockQuantity
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
      }
      images {
        id
        imageUrl
        altText
        isPrimary
        sortOrder
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ADMIN_PRODUCT_STATISTICS = gql`
  query GetAdminProductStatistics {
    productStatistics {
      totalProducts
      activeProducts
      inactiveProducts
      featuredProducts
      outOfStockProducts
      lowStockProducts
      needsReorderProducts
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
      reorderPoint
      inventoryStatus
      imageUrl
      category {
        id
        name
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
        }
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
      }
    }
  }
`;

// ==================== Order Management Queries ====================

export const GET_ADMIN_ORDERS = gql`
  query GetAdminOrders($pagination: PageInput) {
    allOrders(pagination: $pagination) {
      content {
        id
        orderNumber
        status
        paymentStatus
        paymentMethod
        subtotal
        taxAmount
        shippingCost
        discountAmount
        totalAmount
        customerName
        customerEmail
        shippingAddress
        trackingNumber
        carrier
        orderDate
        shippedAt
        deliveredAt
        items {
          id
          productId
          productName
          quantity
          unitPrice
          totalPrice
        }
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
      }
    }
  }
`;

export const GET_ADMIN_ORDER_BY_ID = gql`
  query GetAdminOrder($id: ID!) {
    order(id: $id) {
      order {
        id
        orderNumber
        status
        paymentStatus
        paymentMethod
        subtotal
        taxAmount
        shippingCost
        discountAmount
        totalAmount
        customerName
        customerEmail
        shippingAddress
        trackingNumber
        carrier
        orderDate
        shippedAt
        deliveredAt
        items {
          id
          productId
          productName
          quantity
          unitPrice
          totalPrice
        }
      }
      errors
    }
  }
`;

export const GET_ORDER_STATISTICS = gql`
  query GetOrderStatistics {
    orderStatistics {
      stats {
        totalOrders
        pendingOrders
        processingOrders
        shippedOrders
        deliveredOrders
        cancelledOrders
        totalRevenue
        monthlyRevenue
        averageOrderValue
      }
      errors
    }
  }
`;

// ==================== User Management Queries ====================

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($filter: UserFilterInput, $pagination: PageInput) {
    users(filter: $filter, pagination: $pagination) {
      content {
        id
        email
        username
        firstName
        lastName
        fullName
        phoneNumber
        role
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        page
        size
        totalElements
        totalPages
      }
    }
  }
`;

export const GET_ADMIN_USER_BY_ID = gql`
  query GetAdminUser($id: ID!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      phoneNumber
      role
      isActive
      isVerified
      emailVerified
      phoneVerified
      lastLoginAt
      createdAt
      updatedAt
      addresses {
        id
        street
        city
        state
        country
        postalCode
        isDefault
      }
      orders {
        id
        orderNumber
        status
        totalAmount
        orderDate
      }
    }
  }
`;

export const GET_USER_STATISTICS = gql`
  query GetUserStatistics {
    userStatistics {
      totalUsers
      activeUsers
      inactiveUsers
      newUsersToday
      newUsersThisWeek
      newUsersThisMonth
      usersByRole {
        role
        count
      }
      topCustomers {
        id
        firstName
        lastName
        email
        orderCount
        totalSpent
      }
    }
  }
`;

// ==================== Category Management Queries ====================

export const GET_ADMIN_CATEGORIES = gql`
  query GetAdminCategories {
    categories {
      content {
        id
        name
        slug
        description
        imageUrl
        displayOrder
        parentId
        children {
          id
          name
          slug
        }
        productCount
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        pageNumber
        pageSize
        totalElements
        totalPages
        first
        last
      }
    }
  }
`;

export const GET_ADMIN_CATEGORY_BY_ID = gql`
  query GetAdminCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      image
      displayOrder
      level
      parent {
        id
        name
      }
      children {
        id
        name
        slug
        productsCount
        isActive
      }
      productsCount
      isActive
      seoTitle
      seoDescription
      createdAt
      updatedAt
    }
  }
`;

// ==================== Review Management Queries ====================

export const GET_ADMIN_REVIEWS = gql`
  query GetAdminReviews($filter: ReviewFilterInput, $pagination: PageInput) {
    reviews(filter: $filter, pagination: $pagination) {
      content {
        id
        productId
        productName
        userId
        userName
        rating
        title
        comment
        helpfulCount
        status
        isVerified
        pros
        cons
        images
        createdAt
        updatedAt
      }
      pageInfo {
        pageNumber
        pageSize
        totalElements
        totalPages
        first
        last
      }
    }
  }
`;

export const GET_REVIEW_STATISTICS = gql`
  query GetReviewStatistics {
    reviewStatistics {
      totalReviews
      pendingReviews
      approvedReviews
      rejectedReviews
      averageRating
      reviewsByRating {
        rating
        count
        percentage
      }
      reviewsByStatus {
        status
        count
      }
    }
  }
`;

// ==================== Analytics Queries ====================

export const GET_ADMIN_ANALYTICS = gql`
  query GetAdminAnalytics($startDate: String!, $endDate: String!, $granularity: String!) {
    analytics(startDate: $startDate, endDate: $endDate, granularity: $granularity) {
      revenue {
        date
        amount
        orderCount
      }
      orders {
        date
        count
        averageValue
      }
      topProducts {
        id
        name
        quantity
        revenue
      }
      topCategories {
        id
        name
        revenue
        orderCount
      }
      customerStats {
        newCustomers
        returningCustomers
        totalCustomers
      }
      trafficSources {
        source
        visitors
        conversions
      }
    }
  }
`;

export const GET_SALES_REPORT = gql`
  query GetSalesReport($startDate: String!, $endDate: String!) {
    salesReport(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      totalOrders
      averageOrderValue
      totalDiscounts
      totalTax
      totalShipping
      dailyBreakdown {
        date
        revenue
        orders
        items
      }
      productBreakdown {
        productId
        productName
        quantity
        revenue
      }
    }
  }
`;

// ==================== Inventory Queries ====================

export const GET_INVENTORY_SUMMARY = gql`
  query GetInventorySummary {
    inventorySummary {
      totalProducts
      inStockCount
      lowStockCount
      outOfStockCount
      needsReorderCount
      totalInventoryValue
      averageStockLevel
      stockByCategory {
        category
        count
        value
      }
    }
  }
`;

export const GET_INVENTORY_HISTORY = gql`
  query GetInventoryHistory($productId: ID!, $startDate: String, $endDate: String) {
    inventoryHistory(productId: $productId, startDate: $startDate, endDate: $endDate) {
      id
      productId
      changeType
      quantityChange
      previousQuantity
      newQuantity
      reason
      reference
      createdAt
      createdBy
    }
  }
`;
