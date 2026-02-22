'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
  collapsible?: boolean;
}

export function Sidebar({ items, className = '', collapsible = true }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isActive = (href: string) => pathname === href;

  const toggleItem = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const active = item.href ? isActive(item.href) : false;

    return (
      <div key={item.name} className="w-full">
        {item.href ? (
          <Link
            href={item.href}
            className={`
              flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
              ${level > 0 ? 'ml-4' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </div>
            {hasChildren && !collapsed && (
              <button onClick={(e) => {
                e.preventDefault();
                toggleItem(item.name);
              }}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleItem(item.name)}
            className={`
              w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors
              text-gray-700 hover:bg-gray-100
              ${level > 0 ? 'ml-4' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </div>
            {hasChildren && !collapsed && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            )}
          </button>
        )}

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      <div className="p-4 space-y-2">
        {items.map((item) => renderItem(item))}
      </div>

      {collapsible && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
