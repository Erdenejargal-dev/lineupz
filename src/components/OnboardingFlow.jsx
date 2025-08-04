'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Building, Settings, Bell, Calendar, 
  Check, ChevronRight, ChevronLeft, Mail, 
  Phone, Globe, MapPin, DollarSign, Clock,
  Smartphone, CheckCircle, AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const OnboardingFlow = ({ user, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Profile Setup
    name: user?.name || '',
    email: user?.email || '',
    
    // Business Info
    businessName: user?.businessName || '',
    businessDescription: user?.businessDescription || '',
    businessAddress: user?.businessAddress || '',
    businessWebsite: user?.businessWebsite || '',
    businessCategory: user?.businessCategory || '',
    
    // Service Settings
    appointmentDuration: user?.defaultServiceSettings?.appointmentDuration || 30,
    slotInterval: user?.defaultServiceSettings?.slotInterval || 30,
    advanceBookingDays: user?.defaultServiceSettings?.advanceBookingDays || 7,
    cancellationHours: user?.defaultServiceSettings?.cancellationHours || 2,
    autoConfirmAppointments: user?.defaultServiceSettings?.autoConfirmAppointments !== false,
    pricingEnabled: user?.defaultServiceSettings?.pricing?.enabled || false,
    defaultPrice: user?.defaultServiceSettings?.pricing?.defaultPrice || 0,
    currency: user?.defaultServiceSettings?.pricing?.currency || 'USD',
    
    // Notification Preferences
    emailEnabled: user?.notificationPreferences?.email?.enabled !== false,
    emailAppointmentConfirmations: user?.notificationPreferences?.email?.appointmentConfirmations !== false,
    emailAppointmentReminders: user?.notificationPreferences?.email?.appointmentReminders !== false,
    emailAppointmentCancellations: user?.notificationPreferences?.email?.appointmentCancellations !== false,
    emailQueueUpdates: user?.notificationPreferences?.email?.queueUpdates || false,
    
    smsEnabled: user?.notificationPreferences?.sms?.enabled !== false,
    smsAppointmentConfirmations: user?.notificationPreferences?.sms?.appointmentConfirmations !== false,
    smsAppointmentReminders: user?.notificationPreferences?.sms?.appointmentReminders !== false,
    smsAppointmentCancellations: user?.notificationPreferences?.sms?.appointmentCancellations !== false,
    smsQueueUpdates: user?.notificationPreferences?.sms?.queueUpdates !== false
  });

  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [calendarStatus, setCalendarStatus] = useState({
    connected: false,
    loading: false
  });

  const steps = [
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
      required: false
    },
    {
      id: 'services',
      title: 'Service Settings',
      description: 'Configure your appointment defaults',
      icon: Settings,
      required: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Choose how you want to be notified',
      icon: Bell,
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

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' }
  ];

  useEffect(() => {
    // Load calendar status
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
        // In development, show OTP
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
        // Open Google OAuth in new window
        window.open(data.authUrl, 'google-calendar-auth', 'width=500,height=600');
        
        // Listen for calendar connection
        const checkConnection = setInterval(async () => {
          await loadCalendarStatus();
          if (calendarStatus.connected) {
            clearInterval(checkConnection);
            setCalendarStatus(prev => ({ ...prev, loading: false }));
          }
        }, 2000);
        
        // Stop checking after 5 minutes
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
          break;

        case 'business':
          endpoint = '/auth/profile';
          payload = {
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            businessAddress: formData.businessAddress,
            businessWebsite: formData.businessWebsite,
            businessCategory: formData.businessCategory
          };
          break;

        case 'services':
          endpoint = '/auth/service-settings';
          payload = {
            appointmentDuration: formData.appointmentDuration,
            slotInterval: formData.slotInterval,
            advanceBookingDays: formData.advanceBookingDays,
            cancellationHours: formData.cancellationHours,
            autoConfirmAppointments: formData.autoConfirmAppointments,
            pricing: {
              enabled: formData.pricingEnabled,
              defaultPrice: formData.defaultPrice,
              currency: formData.currency
            }
          };
          break;

        case 'notifications':
          endpoint = '/auth/notification-preferences';
          payload = {
            email: {
              enabled: formData.emailEnabled,
              appointmentConfirmations: formData.emailAppointmentConfirmations,
              appointmentReminders: formData.emailAppointmentReminders,
              appointmentCancellations: formData.emailAppointmentCancellations,
              queueUpdates: formData.emailQueueUpdates
            },
            sms: {
              enabled: formData.smsEnabled,
              appointmentConfirmations: formData.smsAppointmentConfirmations,
              appointmentReminders: formData.smsAppointmentReminders,
              appointmentCancellations: formData.smsAppointmentCancellations,
              queueUpdates: formData.smsQueueUpdates
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
        // Update localStorage with new user data
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
    
    // Save current step data
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

  const handleSkip = () => {
    onSkip();
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
              
              <p className="text-xs text-gray-500 mt-1">
                Required for Google Calendar integration and email notifications
              </p>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category
              </label>
              <select
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.businessWebsite}
                onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Default Appointment Settings</h4>
              <p className="text-sm text-blue-700">
                These will be used as defaults when creating new appointment lines. You can customize them for each line later.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Appointment Duration
                </label>
                <select
                  value={formData.appointmentDuration}
                  onChange={(e) => handleInputChange('appointmentDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot Interval
                </label>
                <select
                  value={formData.slotInterval}
                  onChange={(e) => handleInputChange('slotInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Booking
                </label>
                <select
                  value={formData.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 day ahead</option>
                  <option value={3}>3 days ahead</option>
                  <option value={7}>1 week ahead</option>
                  <option value={14}>2 weeks ahead</option>
                  <option value={30}>1 month ahead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <select
                  value={formData.cancellationHours}
                  onChange={(e) => handleInputChange('cancellationHours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 hour before</option>
                  <option value={2}>2 hours before</option>
                  <option value={4}>4 hours before</option>
                  <option value={24}>24 hours before</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoConfirmAppointments}
                  onChange={(e) => handleInputChange('autoConfirmAppointments', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-confirm appointments (no manual approval needed)</span>
              </label>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Pricing (Optional)</h4>
                  <p className="text-sm text-gray-600">Set default prices for your services</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pricingEnabled}
                    onChange={(e) => handleInputChange('pricingEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable pricing</span>
                </label>
              </div>

              {formData.pricingEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Default Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.defaultPrice}
                      onChange={(e) => handleInputChange('defaultPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Notification Preferences</h4>
              <p className="text-sm text-blue-700">
                Choose how you want to receive notifications about appointments and queue updates.
              </p>
            </div>

            {/* Email Notifications */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                </div>
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
                <div className="space-y-3 ml-7">
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailAppointmentCancellations}
                      onChange={(e) => handleInputChange('emailAppointmentCancellations', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Appointment cancellations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.emailQueueUpdates}
                      onChange={(e) => handleInputChange('emailQueueUpdates', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Queue updates</span>
                  </label>
                </div>
              )}
            </div>

            {/* SMS Notifications */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                </div>
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
                <div className="space-y-3 ml-7">
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smsAppointmentCancellations}
                      onChange={(e) => handleInputChange('smsAppointmentCancellations', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Appointment cancellations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smsQueueUpdates}
                      onChange={(e) => handleInputChange('smsQueueUpdates', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Queue updates</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Google Calendar Integration</h4>
              <p className="text-sm text-blue-700">
                Connect your Google Calendar to automatically sync appointments and check availability.
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
                    Your Google Calendar is connected and ready to sync appointments.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">Benefits:</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Appointments automatically appear in your Google Calendar</li>
                      <li>• Automatic conflict detection with existing events</li>
                      <li>• Email reminders sent by Google Calendar</li>
                      <li>• Sync across all your devices</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Google Calendar</h4>
                    <p className="text-gray-600 mb-6">
                      Sync your appointments with Google Calendar for better organization and automatic reminders.
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
                  
                  <p className="text-xs text-gray-500">
                    This will open a new window to authorize Tabi to access your Google Calendar
                  </p>
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Tabi!</h2>
              <p className="text-gray-600">Let's set up your account to get started</p>
            </div>
            <button
              onClick={handleSkip}
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

export default OnboardingFlow;
