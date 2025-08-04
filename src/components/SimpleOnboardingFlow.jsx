'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Check, ChevronRight, ChevronLeft, 
  Mail, AlertCircle, CheckCircle, Users, Building
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const SimpleOnboardingFlow = ({ user, userType = 'customer', onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Profile Setup (for all users)
    name: user?.name || '',
    email: user?.email || '',
    
    // Creator-specific fields (only for creators)
    businessName: user?.businessName || '',
    businessDescription: user?.businessDescription || '',
    businessAddress: user?.businessAddress || '',
    businessCategory: user?.businessCategory || ''
  });

  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  // Define steps based on user type - SIMPLIFIED
  const getSteps = () => {
    if (userType === 'creator') {
      return [
        {
          id: 'profile',
          title: 'Email Verification',
          description: 'Verify your email address',
          icon: Mail,
          required: true
        },
        {
          id: 'business',
          title: 'Business Details',
          description: 'Basic business information',
          icon: Building,
          required: true
        }
      ];
    } else {
      // Customer onboarding - just email verification
      return [
        {
          id: 'profile',
          title: 'Email Verification',
          description: 'Verify your email address',
          icon: Mail,
          required: true
        }
      ];
    }
  };

  const steps = getSteps();
  const businessCategories = [
    'Healthcare & Medical',
    'Beauty & Wellness',
    'Professional Services',
    'Education & Training',
    'Food & Dining',
    'Retail & Shopping',
    'Automotive',
    'Home Services',
    'Entertainment',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendEmailVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, save the email to the user's profile
      const token = localStorage.getItem('token');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      if (!profileResponse.ok) {
        const profileData = await profileResponse.json();
        setError(profileData.message || 'Failed to save email');
        return;
      }

      // Update localStorage with new user data
      const profileData = await profileResponse.json();
      if (profileData.user) {
        localStorage.setItem('user', JSON.stringify(profileData.user));
      }

      // Now send email verification
      const response = await fetch(`${API_BASE_URL}/auth/send-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setEmailVerificationSent(true);
        if (data.otp) {
          setEmailOtp(data.otp);
        }
      } else {
        setError(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (otp) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (response.ok) {
        setEmailVerificationSent(false);
        setEmailOtp('');
        
        // Update user in localStorage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      } else {
        setError(data.message || 'Failed to verify email');
        return false;
      }
    } catch (error) {
      setError('Failed to verify email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveStepData = async (stepId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      let endpoint = '';
      let payload = {};

      switch (stepId) {
        case 'profile':
          // Profile step is handled by email verification
          return true;

        case 'business':
          endpoint = '/auth/profile';
          payload = {
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            businessAddress: formData.businessAddress,
            businessCategory: formData.businessCategory,
            isCreator: true,
            onboardingCompleted: true // Mark onboarding as complete
          };
          break;

        default:
          return true;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      } else {
        setError(data.message || 'Failed to save data');
        return false;
      }
    } catch (error) {
      setError('Failed to save data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    
    // For profile step, check if email is verified
    if (currentStepData.id === 'profile' && !user?.isEmailVerified) {
      setError('Please verify your email before continuing');
      return;
    }
    
    const saved = await saveStepData(currentStepData.id);
    if (!saved) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete for customers
      if (userType === 'customer') {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ onboardingCompleted: true })
          });
        } catch (error) {
          console.error('Failed to mark onboarding complete:', error);
        }
      }
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Email Verification Required</h4>
              <p className="text-sm text-blue-700">
                We need to verify your email address to send you important notifications.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="space-y-3">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
                
                {formData.email && !user?.isEmailVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Email verification required
                    </div>
                    
                    {!emailVerificationSent ? (
                      <button
                        onClick={sendEmailVerification}
                        disabled={loading || !formData.email}
                        className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-700">
                          Verification code sent to {formData.email}
                        </p>
                        {emailOtp && (
                          <p className="text-xs text-yellow-600">
                            Development: Your code is {emailOtp}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter verification code"
                            className="flex-1 px-2 py-1 border border-yellow-300 rounded text-sm"
                            id="verification-code"
                          />
                          <button
                            onClick={async () => {
                              const input = document.getElementById('verification-code');
                              if (input.value) {
                                const verified = await verifyEmail(input.value);
                                if (verified) {
                                  // Refresh user data
                                  const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
                                  // Force re-render by updating user prop reference
                                  window.location.reload();
                                }
                              }
                            }}
                            disabled={loading}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                          >
                            {loading ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {user?.isEmailVerified && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Email verified ✓
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Business Information</h4>
              <p className="text-sm text-blue-700">
                Basic information about your business for customers.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category *
              </label>
              <select
                required
                value={formData.businessCategory}
                onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {businessCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address (Optional)
              </label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business address for in-person appointments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description of your business"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSkip();
        }
      }}
    >
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userType === 'creator' ? 'Creator Setup' : 'Welcome to Tabi!'}
              </h2>
              <p className="text-gray-600">
                {userType === 'creator' 
                  ? 'Quick setup to start managing appointments'
                  : 'Just verify your email to get started'
                }
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'border-blue-500 text-blue-500' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6">
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={loading || (currentStepData.id === 'profile' && !user?.isEmailVerified)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                  {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleOnboardingFlow;
