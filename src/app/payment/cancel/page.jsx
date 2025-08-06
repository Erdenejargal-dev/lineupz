'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const ref = searchParams.get('ref');

  const getCancelMessage = () => {
    switch (type) {
      case 'subscription':
        return {
          title: 'Subscription Payment Cancelled',
          description: 'Your subscription payment was cancelled. You can try again anytime to activate your premium features.',
          retryAction: 'Try Again',
          retryLink: '/pricing'
        };
      case 'appointment':
        return {
          title: 'Appointment Payment Cancelled',
          description: 'Your appointment payment was cancelled. Your appointment slot is still reserved for a limited time.',
          retryAction: 'Complete Payment',
          retryLink: '/dashboard'
        };
      default:
        return {
          title: 'Payment Cancelled',
          description: 'Your payment was cancelled. No charges have been made to your account.',
          retryAction: 'Try Again',
          retryLink: '/pricing'
        };
    }
  };

  const cancelInfo = getCancelMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {cancelInfo.title}
          </h1>
          <p className="text-gray-600 mb-8">
            {cancelInfo.description}
          </p>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  What happens next?
                </h3>
                <p className="text-sm text-blue-700">
                  No payment has been processed. You can retry the payment anytime or contact support if you need assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={cancelInfo.retryLink}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                {cancelInfo.retryAction}
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-600">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@tabi.mn" className="text-blue-600 hover:underline">
              support@tabi.mn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
