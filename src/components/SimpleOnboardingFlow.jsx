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
    
    // Creator-specific fields
    businessName: user?.businessName || '',
    businessDescription: user?.businessDescription || '',
    businessAddress: user?.businessAddress || '',
    businessWebsite: user?.businessWebsite || '',
    businessCategory: user?.businessCategory || '',
    
    // Notification preferences (for creators)
    emailEnabled: user?.notificationPreferences?.email?.enabled !== false,
    emailAppointmentConfirmations: user?.notificationPreferences?.email?.appointmentConfirmations !== false,
    emailAppointmentReminders: user?.notificationPreferences?.email?.appointmentReminders !== false,
    smsEnabled: user?.notificationPreferences?.sms?.enabled !== false,
    smsAppointmentConfirmations: user?.notificationPreferences?.sms?.appointmentConfirmations !== false,
    smsAppointmentReminders: user?.notificationPreferences?.sms?.smsAppointmentReminders !== false
  });

  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [calendarStatus, setCalendarStatus] = useState({
    connected: false,
    loading: false
  });

  // Define steps based on user type
  const getSteps = () => {
    if (userType === 'creator') {
      return [
        {
          id: 'profile',
          title: 'Profile Setup',
          description: 'Basic information about you',
          icon: User,
          required: true
        },
        {
          id: 'business',
          title: 'Business Information',
          description: 'Tell customers about your business',
          icon: Building,
          required: true
        },
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Choose how you want to be notified',
          icon: Mail,
          required: true
        },
        {
          id: 'calendar',
          title: 'Google Calendar',
          description: 'Connect your calendar for automatic sync',
          icon: Calendar,
          required: false
        }
      ];
    } else {
      // Regular customer onboarding - simplified
      return [
        {
          id: 'profile',
          title: 'Profile Setup',
          description: 'Basic information and email verification',
          icon: User,
          required: true
        },
        {
          id: 'calendar',
          title: 'Google Calendar',
          description: 'Connect your calendar (optional)',
          icon: Calendar,
          required: false
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

  useEffect(() => {
    loadCalendarStatus();
  }, []);

  const loadCalendarStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/google-calendar/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalendarStatus({
          connected: data.calendar?.connected || false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to load calendar status:', error);
    }
  };

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

  const connectGoogleCalendar = async () => {
    try {
      setCalendarStatus(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/google-calendar/auth-url`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        window.open(data.authUrl, 'google-calendar-auth', 'width=500,height=600');
        
        const checkConnection = setInterval(async () => {
          await loadCalendarStatus();
          if (calendarStatus.connected) {
            clearInterval(checkConnection);
            setCalendarStatus(prev => ({ ...prev, loading: false }));
          }
        }, 2000);
        
        setTimeout(() => {
          clearInterval(checkConnection);
          setCalendarStatus(prev => ({ ...prev, loading: false }));
        }, 300000);
      } else {
        setError(data.message || 'Failed to get authorization URL');
        setCalendarStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setError('Failed to connect Google Calendar');
      setCalendarStatus(prev => ({ ...prev, loading: false }));
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
          endpoint = '/auth/profile';
          payload = {
            name: formData.name,
            email: formData.email
          };
          // Mark as creator if this is creator onboarding
          if (userType === 'creator') {
            payload.isCreator = true;
          }
          break;

        case 'business':
          endpoint = '/auth/profile';
          payload = {
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            businessAddress: formData.businessAddress,
            businessWebsite: formData.businessWebsite,
            businessCategory: formData.businessCategory,
            isCreator: true
          };
          break;

        case 'notifications':
          endpoint = '/auth/notification-preferences';
          payload = {
            email: {
              enabled: formData.emailEnabled,
              appointmentConfirmations: formData.emailAppointmentConfirmations,
              appointmentReminders: formData.emailAppointmentReminders
            },
            sms: {
              enabled: formData.smsEnabled,
              appointmentConfirmations: formData.smsAppointmentConfirmations,
              appointmentReminders: formData.smsAppointmentReminders
            }
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
    
    const saved = await saveStepData(currentStepData.id);
    if (!saved) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
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
                        disabled={loading}
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
                        <input
                          type="text"
                          placeholder="Enter verification code"
                          className="w-full px-2 py-1 border border-yellow-300 rounded text-sm"
                          onKeyPress={async (e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              await verifyEmail(e.target.value);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {user?.isEmailVerified && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Email verified
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
                This information will be shown to customers when they book appointments.
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
                Business Address
              </label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business address (for in-person appointments)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief description of your business and services"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Notification Preferences</h4>
              <p className="text-sm text-blue-700">
                Choose how you want to receive notifications about appointments.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailEnabled}
                      onChange={(e) => handleInputChange('emailEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>

                {formData.emailEnabled && (
                  <div className="space-y-2 ml-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.emailAppointmentConfirmations}
                        onChange={(e) => handleInputChange('emailAppointmentConfirmations', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Appointment confirmations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.emailAppointmentReminders}
                        onChange={(e) => handleInputChange('emailAppointmentReminders', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Appointment reminders</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smsEnabled}
                      onChange={(e) => handleInputChange('smsEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>

                {formData.smsEnabled && (
                  <div className="space-y-2 ml-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.smsAppointmentConfirmations}
                        onChange={(e) => handleInputChange('smsAppointmentConfirmations', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Appointment confirmations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.smsAppointmentReminders}
                        onChange={(e) => handleInputChange('smsAppointmentReminders', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Appointment reminders</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Google Calendar Integration</h4>
              <p className="text-sm text-blue-700">
                {userType === 'creator' 
                  ? 'Connect your Google Calendar to automatically sync appointments and check availability.'
                  : 'Connect your Google Calendar to see your appointments (optional).'
                }
              </p>
            </div>

            <div className="text-center py-8">
              {calendarStatus.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-8 w-8" />
                    <span className="text-lg font-medium">Calendar Connected!</span>
                  </div>
                  <p className="text-gray-600">
                    Your Google Calendar is connected and ready.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Google Calendar</h4>
                    <p className="text-gray-600 mb-6">
                      {userType === 'creator'
                        ? 'Sync your appointments with Google Calendar for better organization.'
                        : 'Keep track of your appointments in Google Calendar.'
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={calendarStatus.loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {calendarStatus.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Connect Google Calendar
                      </>
                    )}
                  </button>
                </div>
              )}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userType === 'creator' ? 'Creator Setup' : 'Welcome to Tabi!'}
              </h2>
              <p className="text-gray-600">
                {userType === 'creator' 
                  ? 'Set up your business profile to start managing appointments'
                  : 'Quick setup to get you started'
                }
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip for now
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
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
              {currentStepData.required && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Required</span>
              )}
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

            <div className="flex gap-3">
              {!currentStepData.required && (
                <button
                  onClick={() => {
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      onComplete();
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Skip
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={loading}
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
    </div>
  );
};

export default SimpleOnboardingFlow;
