'use client';

import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Calendar, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';
      
      // Fetch current subscription
      const subResponse = await fetch(`${API_BASE_URL}/subscription/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const subData = await subResponse.json();
      
      // Fetch usage stats
      const usageResponse = await fetch(`${API_BASE_URL}/subscription/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const usageData = await usageResponse.json();
      
      if (subData.success) {
        setSubscription(subData.subscription);
      }
      
      if (usageData.success) {
        setUsage(usageData.usage);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('mn-MN').format(price);
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free': return 'text-gray-600 bg-gray-100';
      case 'basic': return 'text-blue-600 bg-blue-100';
      case 'pro': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      case 'past_due': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Found</h3>
          <p className="text-gray-600 mb-4">
            Unable to load your subscription information.
          </p>
          <button
            onClick={fetchSubscriptionData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getPlanColor(subscription.plan)}`}>
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {subscription.planConfig?.name || subscription.plan} Plan
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
                {subscription.metadata?.upgradeRequested && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                    Upgrade Pending
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {subscription.planConfig?.price > 0 ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(subscription.planConfig.price)}
                </div>
                <div className="text-sm text-gray-600">MNT/month</div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-600">Free</div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Current Usage</h4>
          
          <div className="space-y-4">
            {/* Queues Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Queues</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {usage.current.queuesUsed} / {usage.limits.maxQueues === -1 ? '∞' : usage.limits.maxQueues}
                </span>
              </div>
              {usage.limits.maxQueues !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(usage.percentages.queues)}`}
                    style={{ width: `${Math.min(usage.percentages.queues, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Customers Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Customers This Month</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {usage.current.customersThisMonth} / {usage.limits.maxCustomersPerMonth === -1 ? '∞' : usage.limits.maxCustomersPerMonth}
                </span>
              </div>
              {usage.limits.maxCustomersPerMonth !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(usage.percentages.customers)}`}
                    style={{ width: `${Math.min(usage.percentages.customers, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                {usage.limits.smsNotifications ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className="text-sm text-gray-700">SMS Notifications</span>
              </div>
              
              <div className="flex items-center gap-2">
                {usage.limits.googleCalendarIntegration ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className="text-sm text-gray-700">Google Calendar</span>
              </div>
              
              <div className="flex items-center gap-2">
                {usage.limits.analytics ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className="text-sm text-gray-700">Analytics</span>
              </div>
              
              <div className="flex items-center gap-2">
                {usage.limits.prioritySupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className="text-sm text-gray-700">Priority Support</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {subscription.nextPaymentDate && subscription.plan !== 'free' && (
              <span>Next payment: {new Date(subscription.nextPaymentDate).toLocaleDateString()}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            {subscription.plan === 'free' && (
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Upgrade Plan
              </button>
            )}
            
            {subscription.plan !== 'free' && !subscription.metadata?.upgradeRequested && (
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Plan
              </button>
            )}
            
            {subscription.metadata?.upgradeRequested && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Calendar className="h-4 w-4" />
                Upgrade request submitted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
