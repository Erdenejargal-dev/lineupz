'use client';

import React, { useState, useEffect } from 'react';
import { XCircle, ArrowLeft, RefreshCw, Building, CreditCard } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function BusinessPaymentCancelPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('businessId');
    setBusinessId(id);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        {/* Cancel Icon */}
        <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your business registration payment was cancelled. No charges have been made to your account.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">💡 What happened?</h3>
          <p className="text-sm text-blue-800">
            You cancelled the payment process before completing your business registration. 
            Your business information has been saved and you can complete the payment anytime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/business/register'}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Profile
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Need help?</strong> If you're experiencing payment issues or have questions about business plans, 
            please contact our support team.
          </p>
        </div>

        {/* Business Plans Reminder */}
        <div className="mt-6 text-left">
          <h4 className="font-medium text-gray-900 mb-3">🎯 Business Plan Benefits:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Manage multiple artists under one subscription
            </li>
            <li className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Professional business branding on all lines
            </li>
            <li className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Artist performance analytics and reporting
            </li>
            <li className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Email notifications for join requests
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
