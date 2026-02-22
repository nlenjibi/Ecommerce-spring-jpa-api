'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, memo } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ShoppingCart,
  Users,
  Percent,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  MessageSquare,
  Truck,
  HelpCircle,
  UserCheck,
  Globe,
  Mail,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminHeader } from '@/components/features/admin/AdminHeader';
import { AdminFooter } from '@/components/features/admin/AdminFooter';

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarLinks: SidebarLink[] = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/products', label: 'Products', icon: Package },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/dashboard/admin/tags', label: 'Tags', icon: Tags },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/promotions', label: 'Promotions', icon: Percent },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/performance', label: 'Performance', icon: Activity },
  { href: '/dashboard/admin/tracking', label: 'Event Tracking', icon: Activity },
  { href: '/dashboard/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/admin/subscribers', label: 'Subscribers', icon: UserCheck },
  { href: '/dashboard/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/dashboard/admin/contact-messages', label: 'Messages', icon: Mail },
  { href: '/dashboard/admin/app-download-links', label: 'App Downloads', icon: Globe },
  { href: '/dashboard/admin/help-settings', label: 'Help Settings', icon: HelpCircle },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

interface SidebarItemProps {
  link: SidebarLink;
  isActive: boolean;
}

const SidebarItem = memo(({ link, isActive }: SidebarItemProps) => {
  const Icon = link.icon;
  
  return (
    <li>
      <Link
        href={link.href}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <span className="truncate">{link.label}</span>
      </Link>
    </li>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActiveLink = useMemo(() => {
    return (href: string): boolean => {
      if (href === '/dashboard/admin') {
        return pathname === '/dashboard/admin';
      }
      return pathname.startsWith(href);
    };
  }, [pathname]);

  const activeStates = useMemo(() => {
    return sidebarLinks.map((link) => isActiveLink(link.href));
  }, [isActiveLink]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <Link href="/dashboard/admin" className="text-xl font-bold">
            ShopHub Admin
          </Link>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {sidebarLinks.map((link, index) => (
              <SidebarItem
                key={link.href}
                link={link}
                isActive={activeStates[index]}
              />
            ))}
          </ul>
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="mt-auto p-4 border-t border-gray-800 bg-gray-900">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {user.firstName?.[0]?.toUpperCase() || 'A'}{user.lastName?.[0]?.toUpperCase() || ''}
                  </span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {`${user.username || `${user.firstName || ''} ${user.lastName || ''}`}`.trim()} {String(user.role || '').toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">G</span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white">Guest</p>
                  <p className="text-xs text-gray-400">Not logged in</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        <AdminHeader />
        <div className="flex-1 p-6">{children}</div>
        <AdminFooter />
      </main>
    </div>
  );
}
