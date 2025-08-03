'use client';

import React, { useState } from 'react';
import { X, Info, Clock, Users, Calendar, Settings } from 'lucide-react';

const CreateLineForm = ({ onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'queue',
    maxCapacity: 50,
    estimatedServiceTime: 5,
    codeType: 'stable',
    appointmentSettings: {
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

      if (formData.appointmentSettings.advanceBookingDays < 0 || formData.appointmentSettings.advanceBookingDays > 90) {
        newErrors.advanceBooking = 'Advance booking must be between 0 and 90 days';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                    Advance Booking
                  </label>
                  <select
                    value={formData.appointmentSettings.advanceBookingDays}
                    onChange={(e) => setFormData({
                      ...formData,
                      appointmentSettings: {
                        ...formData.appointmentSettings,
                        advanceBookingDays: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0.04}>1 hour ahead</option>
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
