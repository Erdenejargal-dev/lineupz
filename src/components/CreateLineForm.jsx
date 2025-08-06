'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, Clock, Users, Calendar, Settings, AlertTriangle } from 'lucide-react';

const CreateLineForm = ({ onClose, onSubmit, loading = false }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'queue',
    maxCapacity: 50,
    estimatedServiceTime: 5,
    codeType: 'stable',
    pricing: {
      isPaid: false,
      price: 0
    },
    appointmentSettings: {
      meetingType: 'in-person',
      location: {
        address: '',
        instructions: ''
      },
      onlineSettings: {
        platform: 'google-meet',
        autoCreateMeeting: true,
        meetingInstructions: ''
      },
      duration: 30,
      slotInterval: 30,
      advanceBookingDays: 7,
      cancellationHours: 2,
      autoConfirm: true
    },
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
    ]
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const serviceTypeOptions = [
    {
      value: 'queue',
      label: '🏃 Queue Only',
      description: 'Traditional first-come-first-served line',
      example: 'Perfect for: Coffee shops, retail stores, banks'
    },
    {
      value: 'appointments',
      label: '📅 Appointments Only', 
      description: 'Customers book specific time slots',
      example: 'Perfect for: Hairstylists, doctors, consultants'
    },
    {
      value: 'hybrid',
      label: '🔄 Hybrid Service',
      description: 'Both queue and appointment options',
      example: 'Perfect for: Restaurants, clinics, service centers'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Line title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot be more than 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot be more than 500 characters';
    }

    // Queue/Hybrid specific validation
    if (formData.serviceType === 'queue' || formData.serviceType === 'hybrid') {
      if (!formData.maxCapacity || formData.maxCapacity < 1 || formData.maxCapacity > 200) {
        newErrors.maxCapacity = 'Capacity must be between 1 and 200';
      }

      if (!formData.estimatedServiceTime || formData.estimatedServiceTime < 1 || formData.estimatedServiceTime > 240) {
        newErrors.estimatedServiceTime = 'Service time must be between 1 and 240 minutes';
      }
    }

    // Appointment specific validation
    if (formData.serviceType === 'appointments' || formData.serviceType === 'hybrid') {
      if (formData.appointmentSettings.duration < 5 || formData.appointmentSettings.duration > 480) {
        newErrors.appointmentDuration = 'Duration must be between 5 and 480 minutes';
      }
    }

    // Pricing validation
    if (formData.pricing.isPaid) {
      if (!formData.pricing.price || formData.pricing.price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid services';
      } else if (formData.pricing.price > 1000000) {
        newErrors.price = 'Price cannot exceed 1,000,000';
      }
    }

    // Schedule validation
    const activeSchedules = formData.schedule.filter(s => s.isAvailable);
    if (activeSchedules.length === 0) {
      newErrors.schedule = 'At least one day must be available';
    }

    // Time validation for active schedules
    for (const schedule of activeSchedules) {
      const startMinutes = parseInt(schedule.startTime.split(':')[0]) * 60 + parseInt(schedule.startTime.split(':')[1]);
      const endMinutes = parseInt(schedule.endTime.split(':')[0]) * 60 + parseInt(schedule.endTime.split(':')[1]);
      
      if (endMinutes <= startMinutes) {
        newErrors.schedule = `End time must be after start time for ${dayNames[schedule.day]}`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const updateSchedule = (dayIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const selectedServiceType = serviceTypeOptions.find(opt => opt.value === formData.serviceType);

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Line</h2>
            <p className="text-sm text-gray-600">Set up your queue or appointment system</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.serviceType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, serviceType: option.value })}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="serviceType"
                      value={option.value}
                      checked={formData.serviceType === option.value}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="mr-3"
                    />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <p className="text-xs text-gray-500">{option.example}</p>
                </div>
              ))}
            </div>
            {selectedServiceType && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>{selectedServiceType.label}:</strong> {selectedServiceType.description}
                    <br />
                    <span className="text-blue-600">{selectedServiceType.example}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={
                  formData.serviceType === 'queue' ? 'Coffee Shop Queue' :
                  formData.serviceType === 'appointments' ? 'Hair Salon Appointments' :
                  'Restaurant Service'
                }
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows="3"
                placeholder={
                  formData.serviceType === 'queue' ? 'Queue for coffee orders and pickup' :
                  formData.serviceType === 'appointments' ? 'Professional hair styling and cuts' :
                  'Dine-in and takeout orders'
                }
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Pricing Settings */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💰</span>
              <h3 className="font-medium text-green-900">Service Pricing</h3>
            </div>

            {/* Is Paid Toggle */}
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricing.isPaid}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: {
                      ...formData.pricing,
                      isPaid: e.target.checked,
                      price: e.target.checked ? formData.pricing.price || 5000 : 0
                    }
                  })}
                  className="mr-3 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <span className="font-medium text-green-900">This is a paid service</span>
                  <p className="text-sm text-green-700">Customers will need to pay when joining/booking</p>
                </div>
              </label>
            </div>

            {/* Pricing Details - Only show if isPaid is true */}
            {formData.pricing.isPaid && (
              <div className="space-y-4 p-4 bg-white rounded-lg border border-green-200">
                {/* Price Input - Simple MNT only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (MNT) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      required={formData.pricing.isPaid}
                      value={formData.pricing.price || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          price: parseInt(e.target.value) || 0
                        }
                      })}
                      className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="5000"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₮</span>
                    </div>
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.serviceType === 'queue' ? 'Price per queue join' : 
                     formData.serviceType === 'appointments' ? 'Price per appointment' : 
                     'Price per service'}
                  </p>
                </div>

                {/* Simple Pricing Preview */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💡 Pricing Preview</h4>
                  <p className="text-sm text-green-800">
                    Customers will pay <strong>₮{formData.pricing.price?.toLocaleString() || '0'}</strong> {
                      formData.serviceType === 'queue' ? 'to join the queue' :
                      formData.serviceType === 'appointments' ? 'per appointment' :
                      'per service'
                    }
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    ✅ Payments will be processed through BYL
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Queue/Hybrid Settings */}
          {(formData.serviceType === 'queue' || formData.serviceType === 'hybrid') && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Queue Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxCapacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxCapacity && <p className="mt-1 text-sm text-red-600">{errors.maxCapacity}</p>}
                  <p className="mt-1 text-xs text-gray-500">Maximum people allowed in queue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Time (minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    required
                    value={formData.estimatedServiceTime}
                    onChange={(e) => setFormData({ ...formData, estimatedServiceTime: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedServiceTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.estimatedServiceTime && <p className="mt-1 text-sm text-red-600">{errors.estimatedServiceTime}</p>}
                  <p className="mt-1 text-xs text-gray-500">Average time to serve each customer</p>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Settings */}
          {(formData.serviceType === 'appointments' || formData.serviceType === 'hybrid') && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Appointment Settings</h3>
              </div>

              {/* Meeting Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meeting Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.appointmentSettings.meetingType === 'in-person'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        meetingType: 'in-person'
                      }
                    })}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="meetingType"
                        value="in-person"
                        checked={formData.appointmentSettings.meetingType === 'in-person'}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            meetingType: e.target.value
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="font-medium text-gray-900">🏢 In-Person</span>
                    </div>
                    <p className="text-xs text-gray-600">Customers visit your location</p>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.appointmentSettings.meetingType === 'online'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        meetingType: 'online'
                      }
                    })}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="meetingType"
                        value="online"
                        checked={formData.appointmentSettings.meetingType === 'online'}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            meetingType: e.target.value
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="font-medium text-gray-900">💻 Online</span>
                    </div>
                    <p className="text-xs text-gray-600">Google Meet video calls</p>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.appointmentSettings.meetingType === 'both'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        meetingType: 'both'
                      }
                    })}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="meetingType"
                        value="both"
                        checked={formData.appointmentSettings.meetingType === 'both'}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            meetingType: e.target.value
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="font-medium text-gray-900">🔄 Both Options</span>
                    </div>
                    <p className="text-xs text-gray-600">Let customers choose</p>
                  </div>
                </div>
              </div>

              {/* Location Settings for In-Person */}
              {(formData.appointmentSettings.meetingType === 'in-person' || formData.appointmentSettings.meetingType === 'both') && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">📍 Location Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Address
                      </label>
                      <input
                        type="text"
                        value={formData.appointmentSettings.location?.address || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            location: {
                              ...formData.appointmentSettings.location,
                              address: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Business Street, City, State 12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        value={formData.appointmentSettings.location?.instructions || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            location: {
                              ...formData.appointmentSettings.location,
                              instructions: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter through main entrance, take elevator to 2nd floor, Suite 201"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Online Meeting Settings */}
              {(formData.appointmentSettings.meetingType === 'online' || formData.appointmentSettings.meetingType === 'both') && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-3">💻 Online Meeting Settings</h4>
                  
                  {/* Google Calendar Connection Warning */}
                  {user && !user.googleCalendar?.connected && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-orange-900 mb-1">Google Calendar Required</p>
                          <p className="text-orange-800 mb-2">
                            To create online appointments with automatic Google Meet links, you need to connect your Google Calendar first.
                          </p>
                          <button
                            type="button"
                            onClick={() => window.location.href = '/creator-dashboard?tab=calendar'}
                            className="text-orange-700 hover:text-orange-900 underline text-sm font-medium"
                          >
                            Connect Google Calendar →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Platform
                      </label>
                      <select
                        value={formData.appointmentSettings.onlineSettings?.platform || 'google-meet'}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            onlineSettings: {
                              ...formData.appointmentSettings.onlineSettings,
                              platform: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="google-meet">Google Meet (Recommended)</option>
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="custom">Custom Platform</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.appointmentSettings.onlineSettings?.autoCreateMeeting !== false}
                          onChange={(e) => setFormData({
                            ...formData,
                            appointmentSettings: {
                              ...formData.appointmentSettings,
                              onlineSettings: {
                                ...formData.appointmentSettings.onlineSettings,
                                autoCreateMeeting: e.target.checked
                              }
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Automatically create meeting links</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Google Meet links will be created automatically and sent to both parties</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Instructions
                      </label>
                      <textarea
                        value={formData.appointmentSettings.onlineSettings?.meetingInstructions || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          appointmentSettings: {
                            ...formData.appointmentSettings,
                            onlineSettings: {
                              ...formData.appointmentSettings.onlineSettings,
                              meetingInstructions: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Please ensure you have a stable internet connection and test your camera/microphone beforehand"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={formData.appointmentSettings.duration}
                    onChange={(e) => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        duration: parseInt(e.target.value)
                      }
                    })}
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
                    Time Slots
                  </label>
                  <select
                    value={formData.appointmentSettings.slotInterval}
                    onChange={(e) => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        slotInterval: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <select
                    value={formData.appointmentSettings.cancellationHours}
                    onChange={(e) => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        cancellationHours: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={4}>4 hours before</option>
                    <option value={24}>24 hours before</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.appointmentSettings.autoConfirm}
                    onChange={(e) => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        autoConfirm: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Auto-confirm appointments</span>
                </label>
              </div>
            </div>
          )}

          {/* Advanced Settings Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4">
              {/* Operating Hours */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Operating Hours</h3>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                  {formData.schedule.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={day.isAvailable}
                            onChange={(e) => updateSchedule(index, 'isAvailable', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">{dayNames[day.day]}</span>
                        </label>
                      </div>
                      
                      {day.isAvailable ? (
                        <>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-gray-500 text-sm">to</span>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </>
                      ) : (
                        <div className="flex-1 text-center text-sm text-gray-500">Closed</div>
                      )}
                    </div>
                  ))}
                  {errors.schedule && <p className="text-sm text-red-600">{errors.schedule}</p>}
                </div>
              </div>

              {/* Code Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Type
                </label>
                <select
                  value={formData.codeType}
                  onChange={(e) => setFormData({ ...formData, codeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stable">Stable (permanent code)</option>
                  <option value="temporary">Temporary (expires in 24h)</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : `Create ${formData.serviceType === 'queue' ? 'Queue' : formData.serviceType === 'appointments' ? 'Appointment Line' : 'Hybrid Line'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLineForm;
