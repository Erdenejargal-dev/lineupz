'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const type = searchParams.get('type');
  const ref = searchParams.get('ref');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!ref) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${ref}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data.payment);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [ref]);

  const getSuccessMessage = () => {
    switch (type) {
      case 'subscription':
        return {
          title: 'Subscription Activated!',
          description: 'Your subscription has been successfully activated. You now have access to all premium features.',
          icon: <Calendar className="w-16 h-16 text-green-500" />,
          nextAction: 'Go to Dashboard',
          nextLink: '/creator-dashboard'
        };
      case 'appointment':
        return {
          title: 'Appointment Confirmed!',
          description: 'Your appointment has been confirmed and payment processed successfully.',
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          nextAction: 'View Appointments',
          nextLink: '/dashboard'
        };
      default:
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
          icon: <Receipt className="w-16 h-16 text-green-500" />,
          nextAction: 'Go to Dashboard',
          nextLink: '/dashboard'
        };
    }
  };

  const successInfo = getSuccessMessage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            {successInfo.icon}
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {successInfo.title}
          </h1>
          <p className="text-gray-600 mb-8">
            {successInfo.description}
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{paymentDetails.formattedAmount || `${paymentDetails.amount} MNT`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize text-green-600">{paymentDetails.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentDetails.paymentMethod || 'QPay'}</span>
                </div>
                {paymentDetails.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{paymentDetails.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={successInfo.nextLink}>
              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                {successInfo.nextAction}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
