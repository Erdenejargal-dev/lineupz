'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Star, ArrowRight, Shield, Zap, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      toast.info('You are already on the free plan!');
      return;
    }
    
    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mn-MN').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {Object.entries(plans).map(([planId, plan]) => (
            <div
              key={planId}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                planId === 'pro' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {planId === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600 ml-2">MNT/month</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(planId)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    planId === 'pro'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : planId === 'free'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {planId === 'free' ? 'Current Plan' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-900">Features</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Basic</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900 bg-blue-50 rounded-t-lg">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-4 text-gray-700">Number of Queues</td>
                  <td className="py-4 px-4 text-center">1</td>
                  <td className="py-4 px-4 text-center">5</td>
                  <td className="py-4 px-4 text-center bg-blue-50">Unlimited</td>
                  <td className="py-4 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Customers per Month</td>
                  <td className="py-4 px-4 text-center">50</td>
                  <td className="py-4 px-4 text-center">500</td>
                  <td className="py-4 px-4 text-center bg-blue-50">5,000</td>
                  <td className="py-4 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">SMS Notifications</td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Google Calendar Integration</td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Advanced Analytics</td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center">Basic</td>
                  <td className="py-4 px-4 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Priority Support</td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-blue-50"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">White-label Options</td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center bg-blue-50"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">
              Your data is protected with enterprise-grade security and 99.9% uptime guarantee.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Setup</h3>
            <p className="text-gray-600">
              Get started in minutes with our intuitive interface and guided onboarding.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our dedicated support team is here to help you succeed every step of the way.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept QPay and major credit cards for your convenience.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No setup fees! You only pay the monthly subscription fee for your chosen plan.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. No long-term contracts required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          plan={plans[selectedPlan]}
          planId={selectedPlan}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ plan, planId, onClose }: { 
  plan: Plan; 
  planId: string; 
  onClose: () => void; 
}) {
  const [paymentMethod, setPaymentMethod] = useState('qpay');
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: planId,
          paymentMethod,
          bankTransactionId: paymentMethod === 'bank_transfer' ? bankTransactionId : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        onClose();
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to process upgrade request');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mn-MN').format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upgrade to {plan.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{plan.name} Plan</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(plan.price)} MNT/month
              </span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qpay"
                    checked={true}
                    readOnly
                    className="mr-3"
                  />
                  <span className="font-medium text-blue-900">QPay</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Secure and instant payment through QPay
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (paymentMethod === 'bank_transfer' && !bankTransactionId)}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your subscription will be activated within 24 hours after payment verification.
          </p>
        </div>
      </div>
    </div>
  );
}
