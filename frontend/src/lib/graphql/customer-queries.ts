import { gql } from '@apollo/client';

/**
 * Customer GraphQL Queries
 * 
 * These queries are used for customer data fetching operations.
 * Following the REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations)
 */

// ==================== Customer Orders Queries ====================

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($pagination: PageInput) {
    myOrders(pagination: $pagination) {
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
        shippingAddress
        trackingNumber
        carrier
        orderDate
        shippedAt
        deliveredAt
        estimatedDeliveryDate
        customerNotes
        items {
          id
          productId
          productName
          productImageUrl
          quantity
          unitPrice
          discount
          totalPrice
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

export const GET_CUSTOMER_ORDER_BY_ID = gql`
  query GetCustomerOrder($id: ID!) {
    order(id: $id) {
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
      estimatedDeliveryDate
      cancelledAt
      cancellationReason
      customerNotes
      items {
        id
        productId
        productName
        productImageUrl
        quantity
        unitPrice
        discount
        totalPrice
      }
    }
  }
`;

export const GET_CUSTOMER_ORDER_STATS = gql`
  query GetCustomerOrderStats {
    myOrders(pagination: { page: 0, size: 1000 }) {
      content {
        id
        status
        totalAmount
        items {
          id
        }
      }
    }
  }
`;

// ==================== Customer Profile Queries ====================

export const GET_CUSTOMER_PROFILE = gql`
  query GetCustomerProfile {
    me {
      id
      username
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      gender
      avatar
      role
      isActive
      isVerified
      emailVerified
      phoneVerified
      createdAt
      lastLoginAt
    }
  }
`;

export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses {
    myAddresses {
      id
      label
      street
      city
      state
      country
      postalCode
      isDefault
      createdAt
    }
  }
`;

// ==================== Customer Wishlist Queries ====================

export const GET_CUSTOMER_WISHLIST = gql`
  query GetCustomerWishlist {
    myWishlist {
      id
      productId
      product {
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
        inStock
        category {
          id
          name
        }
      }
      notes
      priority
      targetPrice
      notifyOnPriceDrop
      notifyOnStock
      addedAt
    }
  }
`;

// ==================== Customer Dashboard Queries ====================

export const GET_CUSTOMER_DASHBOARD = gql`
  query GetCustomerDashboard {
    customerDashboard {
      user {
        id
        firstName
        lastName
        email
        avatar
      }
      stats {
        totalOrders
        pendingOrders
        deliveredOrders
        totalSpent
        wishlistCount
      }
      recentOrders {
        id
        orderNumber
        status
        totalAmount
        itemCount
        orderDate
      }
      notifications {
        id
        type
        title
        message
        isRead
        createdAt
      }
    }
  }
`;

// ==================== Customer Reviews Queries ====================

export const GET_CUSTOMER_REVIEWS = gql`
  query GetCustomerReviews {
    myReviews {
      id
      productId
      productName
      productImage
      rating
      title
      comment
      helpfulCount
      isVerified
      status
      createdAt
    }
  }
`;

// ==================== Customer Notifications Queries ====================

export const GET_CUSTOMER_NOTIFICATIONS = gql`
  query GetCustomerNotifications($unreadOnly: Boolean, $page: Int, $size: Int) {
    myNotifications(unreadOnly: $unreadOnly, page: $page, size: $size) {
      content {
        id
        type
        title
        message
        actionUrl
        isRead
        readAt
        createdAt
      }
      pageInfo {
        pageNumber
        pageSize
        totalElements
        totalPages
      }
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;
