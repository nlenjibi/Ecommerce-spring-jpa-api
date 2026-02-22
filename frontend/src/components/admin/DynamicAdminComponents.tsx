import dynamic from 'next/dynamic';

// Heavy components that should be lazy-loaded
export const AdminProductsPage = dynamic(
  () => import('@/app/dashboard/admin/products/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Products...</div>,
    ssr: false 
  }
);

export const AdminOrdersPage = dynamic(
  () => import('@/app/dashboard/admin/orders/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Orders...</div>,
    ssr: false 
  }
);

export const AdminUsersPage = dynamic(
  () => import('@/app/dashboard/admin/users/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Users...</div>,
    ssr: false 
  }
);

export const AdminAnalyticsPage = dynamic(
  () => import('@/app/dashboard/admin/analytics/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Analytics...</div>,
    ssr: false 
  }
);

export const AdminCategoriesPage = dynamic(
  () => import('@/app/dashboard/admin/categories/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Categories...</div>,
    ssr: false 
  }
);

export const AdminReviewsPage = dynamic(
  () => import('@/app/dashboard/admin/reviews/page').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading Reviews...</div>,
    ssr: false 
  }
);

// Chart components - heavy for bundle size
export const SalesChart = dynamic(
  () => import('@/components/charts/SalesChart').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false 
  }
);

export const RevenueChart = dynamic(
  () => import('@/components/charts/RevenueChart').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false 
  }
);

export const UserActivityChart = dynamic(
  () => import('@/components/charts/UserActivityChart').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false 
  }
);

// Report components
export const OrderReport = dynamic(
  () => import('@/components/reports/OrderReport').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Generating Report...</div>,
    ssr: false 
  }
);

export const SalesReport = dynamic(
  () => import('@/components/reports/SalesReport').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Generating Report...</div>,
    ssr: false 
  }
);

export const UserReport = dynamic(
  () => import('@/components/reports/UserReport').then(mod => ({ default: mod.default })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Generating Report...</div>,
    ssr: false 
  }
);