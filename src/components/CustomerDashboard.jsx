'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, MapPin, RefreshCw, LogOut, Plus, QrCode, Star, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const CustomerDashboard = () => {
  const [myQueue, setMyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [reviewableServices, setReviewableServices] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('token'));
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setToken(null);
          localStorage.removeItem('token');
          throw new Error('Please log in again');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Load user's queue positions
  const loadMyQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/queue/my-queue');
      setMyQueue(data.queueEntries || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Leave a line
  const leaveLine = async (entryId) => {
    try {
      setRefreshing(true);
      await apiCall(`/queue/entry/${entryId}/leave`, {
        method: 'PATCH'
      });
      
      await loadMyQueue();
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Load reviewable services
  const loadReviewableServices = async () => {
    try {
      const data = await apiCall('/reviews/reviewable');
      setReviewableServices(data.services || []);
    } catch (error) {
      console.error('Error loading reviewable services:', error);
    }
  };

  // Submit a review
  const submitReview = async (reviewData) => {
    try {
      await apiCall('/reviews/submit', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      
      // Refresh reviewable services
      await loadReviewableServices();
      setShowReviewModal(false);
      setSelectedService(null);
    } catch (error) {
      setError(error.message);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      loadMyQueue();
      loadReviewableServices();
    }
  }, [token]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (token && myQueue.length > 0) {
      const interval = setInterval(() => {
        loadMyQueue();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [token, myQueue]);

  // Login check - show loading until client-side hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to see your queue positions.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const QueueCard = ({ queueEntry, onLeave }) => {
    const formatTimeAgo = (date) => {
      const minutes = Math.round((Date.now() - new Date(date)) / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.round(minutes / 60);
      return `${hours}h ago`;
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{queueEntry.line.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{queueEntry.line.description}</p>
          </div>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {queueEntry.line.lineCode}
          </span>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              #{queueEntry.position}
            </div>
            <p className="text-sm text-blue-800">Your position in line</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-orange-600">
              {queueEntry.estimatedWaitTime || 0}m
            </p>
            <p className="text-xs text-gray-500">Estimated wait</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">
              {formatTimeAgo(queueEntry.joinedAt)}
            </p>
            <p className="text-xs text-gray-500">Joined</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What to expect:</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Keep this page open for updates</li>
            <li>• You'll be notified when it's your turn</li>
            <li>• Your position updates automatically</li>
          </ul>
        </div>

        <button
          onClick={() => onLeave(queueEntry._id)}
          disabled={refreshing}
          className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {refreshing ? 'Leaving...' : 'Leave Line'}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your queues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* REMOVED THE DUPLICATE HEADER - Main header is handled by layout */}
      
      {/* Page Title Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Lines</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || 'there'}! Here are your current queue positions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadMyQueue}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => window.location.href = '/join'}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
          >
            <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Join a Line</h3>
            <p className="text-sm text-gray-600">Enter a 6-digit code to join a queue</p>
          </button>

          <button
            onClick={() => window.location.href = '/creator-dashboard'}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Create Lines</h3>
            <p className="text-sm text-gray-600">Switch to creator mode to manage queues</p>
          </button>
        </div>

        {/* Current Queues */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Current Queues</h2>
          
          {myQueue.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active queues</h3>
              <p className="text-gray-600 mb-6">You're not currently waiting in any lines.</p>
              <button
                onClick={() => window.location.href = '/join'}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Join Your First Line
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myQueue.map(queueEntry => (
                <QueueCard
                  key={queueEntry._id}
                  queueEntry={queueEntry}
                  onLeave={leaveLine}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviewable Services */}
        {reviewableServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Rate Your Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewableServices.map(service => (
                <div key={service._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{service.line.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.business.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          {service.type === 'appointment' ? 'Appointment' : 'Queue'} completed
                        </p>
                        <p className="text-xs text-green-600">
                          {new Date(service.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {service.type === 'queue' && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-800">#{service.position}</p>
                          <p className="text-xs text-green-600">Position</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowReviewModal(true);
                    }}
                    className="w-full bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Send Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-1">1. Get a code</div>
              <div>Ask for a 6-digit line code from the business or service</div>
            </div>
            <div>
              <div className="font-medium mb-1">2. Join the line</div>
              <div>Enter the code and see your position in the queue</div>
            </div>
            <div>
              <div className="font-medium mb-1">3. Wait your turn</div>
              <div>Get real-time updates on your position and wait time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedService && (
        <ReviewModal
          service={selectedService}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedService(null);
          }}
          onSubmit={submitReview}
        />
      )}
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ service, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    waitTime: 0,
    serviceQuality: 0,
    staff: 0,
    cleanliness: 0
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        businessId: service.business._id,
        lineId: service.line._id,
        queueEntryId: service.type === 'queue' ? service._id : null,
        appointmentId: service.type === 'appointment' ? service._id : null,
        rating,
        comment: comment.trim(),
        serviceType: service.serviceType,
        aspects: Object.fromEntries(
          Object.entries(aspects).filter(([_, value]) => value > 0)
        ),
        isAnonymous
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 w-24">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{service.line.title}</h3>
            <p className="text-sm text-gray-600">{service.business.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {service.type === 'appointment' ? 'Appointment' : 'Queue'} completed on{' '}
              {new Date(service.completedAt).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Overall Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Detailed Aspects */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate Specific Aspects (Optional)
              </label>
              <div className="space-y-3">
                <StarRating
                  value={aspects.waitTime}
                  onChange={(value) => setAspects(prev => ({ ...prev, waitTime: value }))}
                  label="Wait Time"
                />
                <StarRating
                  value={aspects.serviceQuality}
                  onChange={(value) => setAspects(prev => ({ ...prev, serviceQuality: value }))}
                  label="Service"
                />
                <StarRating
                  value={aspects.staff}
                  onChange={(value) => setAspects(prev => ({ ...prev, staff: value }))}
                  label="Staff"
                />
                <StarRating
                  value={aspects.cleanliness}
                  onChange={(value) => setAspects(prev => ({ ...prev, cleanliness: value }))}
                  label="Cleanliness"
                />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>
            </div>

            {/* Submit Buttons */}
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
                disabled={rating === 0 || submitting}
                className="flex-1 py-3 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
