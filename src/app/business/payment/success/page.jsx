'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CheckCircle, Building, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

function BusinessPaymentSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const businessId = searchParams.get('businessId');
    const paymentId = searchParams.get('payment_id');
    
    if (businessId && paymentId) {
      handlePaymentSuccess(businessId, paymentId);
    } else {
      setError('Missing payment information');
      setLoading(false);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (businessId, paymentId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/business/payment/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId,
          paymentId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBusiness(data.business);
        setSuccess(true);
        
        // Update user in localStorage to reflect business ownership
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          user.isCreator = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        setError(data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {processing ? 'Processing Payment...' : 'Loading...'}
          </h2>
          <p className="text-gray-600">
            {processing ? 'Please wait while we activate your business account.' : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/business/register'}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-6">
          {/* Success Icon */}
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Business Registration Complete!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Congratulations! Your business <strong>{business?.name}</strong> has been successfully registered and activated.
          </p>

          {/* Business Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{business?.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Plan Status</p>
                <p className="text-lg font-bold text-purple-600">Active</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Business ID</p>
                <p className="text-lg font-bold text-blue-600">{business?.id?.slice(-8)}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Payment</p>
                <p className="text-lg font-bold text-green-600">Confirmed</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 What's Next?</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-blue-900">Access Your Business Dashboard</p>
                  <p className="text-sm text-blue-700">Manage artists, view statistics, and handle join requests</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-blue-900">Review Join Requests</p>
                  <p className="text-sm text-blue-700">Artists can now send requests to join your business</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-blue-900">Start Creating Lines</p>
                  <p className="text-sm text-blue-700">You and your approved artists can create appointment lines</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/business/dashboard'}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Building className="h-5 w-5" />
              Go to Business Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => window.location.href = '/creator-dashboard'}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="h-5 w-5" />
              Creator Dashboard
            </button>
          </div>

          {/* Email Notification Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              📧 <strong>Email Notifications:</strong> You'll receive email notifications when artists request to join your business. 
              Check your email regularly and manage requests from your business dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function BusinessPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <BusinessPaymentSuccessContent />
    </Suspense>
  );
}
