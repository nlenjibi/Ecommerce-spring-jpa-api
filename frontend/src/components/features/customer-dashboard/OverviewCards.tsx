"use client";
import React from 'react';
import { ShoppingBag, Clock, Package, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useCustomerOrderStats } from '@/hooks/customer/use-customer-graphql';
import { LoadingState } from './LoadingStates';

interface OverviewData {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  monthOrders?: number;
  orderTrend?: 'up' | 'down';
  wishlistCount?: number;
}

export default function OverviewCards() {
  const { stats, loading, error } = useCustomerOrderStats();

  const data: OverviewData = stats || {
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  };

  if (loading) {
    return <LoadingState type="card" message="Loading stats..." />;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Failed to load dashboard stats
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Orders',
      value: data.totalOrders,
      subtitle: 'All time',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: data.orderTrend || 'up',
      trendValue: '+12%',
    },
    {
      title: 'Pending Orders',
      value: data.pendingOrders,
      subtitle: 'Awaiting processing',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'down',
      trendValue: '-2%',
    },
    {
      title: 'Delivered',
      value: data.deliveredOrders,
      subtitle: 'Successfully delivered',
      icon: Package,
      color: 'bg-green-500',
      trend: 'up',
      trendValue: '+8%',
    },
    {
      title: 'Total Spent',
      value: `$${(data.totalSpent || 0).toFixed(2)}`,
      subtitle: 'Lifetime spending',
      icon: Wallet,
      color: 'bg-purple-500',
      trend: 'up',
      trendValue: '+15%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${card.color} bg-opacity-10 rounded-lg`}>
                <Icon size={20} className={`text-${card.color.replace('bg-', '')}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendIcon size={14} />
                <span className="font-medium">{card.trendValue}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
            </div>
            
            {/* Mini progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    card.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: card.trend === 'up' 
                      ? `${Math.min(100, (parseInt(card.trendValue.replace(/[^0-9]/g, '')) * 5))}%` 
                      : '20%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
