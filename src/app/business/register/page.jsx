'use client';

import React, { useState, useEffect } from 'react';
import { Building, CreditCard, Check, ArrowLeft, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

export default function BusinessRegisterPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [plans, setPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      website: ''
    }
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // Allow access without authentication for business registration
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }

    // Fetch business plans
    fetchPlans();
    setLoading(false);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/plans`);
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      } else {
        // Fallback to static plans if API fails
        setPlans(getStaticPlans());
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback to static plans if API fails
      setPlans(getStaticPlans());
    }
  };

  const getStaticPlans = () => ({
    starter: {
      name: 'Starter Plan',
      maxArtists: 5,
      maxLinesPerArtist: 3,
      price: 120000,
      features: ['Basic queue management', 'SMS notifications', 'Basic analytics', '3 lines per artist']
    },
    professional: {
      name: 'Professional Plan', 
      maxArtists: 8,
      maxLinesPerArtist: 10,
      price: 200000,
      features: ['Advanced queue management', 'SMS & Email notifications', 'Advanced analytics', 'Calendar integration', '10 lines per artist']
    },
    enterprise: {
      name: 'Enterprise Plan',
      maxArtists: 12,
      maxLinesPerArtist: 999,
      price: 250000,
      features: ['Full queue management', 'All notifications', 'Complete analytics', 'Calendar integration', 'Priority support', 'Unlimited lines per artist']
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: grandchild ? {
            ...prev[parent][child],
            [grandchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get selected plan details
      const selectedPlanDetails = plans[selectedPlan];
      if (!selectedPlanDetails) {
        setError('Please select a valid plan');
        setSubmitting(false);
        return;
      }

      // Create business record first (without requiring authentication)
      const businessData = {
        ...formData,
        plan: selectedPlan,
        planDetails: selectedPlanDetails,
        status: 'pending_payment',
        userId: user?.id || null,
        createdAt: new Date().toISOString()
      };

      // Store business data locally (simulating database creation)
      const businessId = 'business_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('createdBusiness', JSON.stringify({
        id: businessId,
        ...businessData
      }));

      // Show success message and redirect to payment
      setSuccess('Business registered successfully! Redirecting to payment...');
      
      setTimeout(() => {
        // Use the backend business registration endpoint
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        fetch(`${API_BASE_URL}/business/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            contact: formData.contact,
            plan: selectedPlan
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.paymentUrl) {
            // Store business registration info for success page
            localStorage.setItem('pendingBusinessRegistration', JSON.stringify({
              id: data.business.id,
              plan: selectedPlan,
              planName: selectedPlanDetails.name,
              amount: selectedPlanDetails.price,
              businessData: formData,
              timestamp: Date.now()
            }));
            
            // Redirect to BYL payment
            window.location.href = data.paymentUrl;
          } else {
            setError(data.message || 'Failed to register business');
            setSubmitting(false);
          }
        })
        .catch(error => {
          console.error('Business registration error:', error);
          setError('Failed to register business. Please try again.');
          setSubmitting(false);
        });
      }, 1500);
      
    } catch (error) {
      console.error('Business registration error:', error);
      setError('Failed to process business registration');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Register Your Business</h1>
          <p className="text-gray-600">Start managing multiple artists with professional business plans</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select category</option>
                      <option value="salon">Hair Salon</option>
                      <option value="clinic">Medical Clinic</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="retail">Retail Store</option>
                      <option value="service">Service Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact.email}
                      onChange={(e) => handleInputChange('contact.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="business@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact.phone}
                      onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+976 99123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.contact.website}
                      onChange={(e) => handleInputChange('contact.website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contact.address.street}
                        onChange={(e) => handleInputChange('contact.address.street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="123 Business Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contact.address.city}
                        onChange={(e) => handleInputChange('contact.address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ulaanbaatar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contact.address.state}
                        onChange={(e) => handleInputChange('contact.address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ulaanbaatar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={formData.contact.address.zipCode}
                        onChange={(e) => handleInputChange('contact.address.zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="14200"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Brief description of your business"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Continue to Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
              
              <div className="space-y-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlan === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === key
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPlan === key && (
                          <Check className="w-3 h-3 text-white m-0.5" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      ₮{plan.price?.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">/year</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      Up to {plan.maxArtists} artists • {plan.maxLinesPerArtist === 999 ? 'Unlimited' : plan.maxLinesPerArtist} lines per artist
                    </div>
                    
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What you get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Manage multiple artists</li>
                  <li>• Shared subscription benefits</li>
                  <li>• Business branding on lines</li>
                  <li>• Artist performance analytics</li>
                  <li>• Professional dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
