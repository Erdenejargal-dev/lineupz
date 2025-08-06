// ===== lib/api.js =====
// Centralized API configuration and utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export { API_BASE_URL };

// API client with automatic token handling
export class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async sendOTP(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone, otp, name) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // SMS testing method
  async sendTestSMS(phoneNumber, message) {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, message }),
    });
  }

  // Line methods
  async getLineByCode(code) {
    return this.request(`/lines/code/${code}`);
  }

  async createLine(lineData) {
    return this.request('/lines', {
      method: 'POST',
      body: JSON.stringify(lineData),
    });
  }

  async getMyLines() {
    return this.request('/lines/my-lines');
  }

  async getLineDetails(lineId) {
    return this.request(`/lines/${lineId}`);
  }

  async updateLine(lineId, data) {
    return this.request(`/lines/${lineId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleLineAvailability(lineId) {
    return this.request(`/lines/${lineId}/toggle-availability`, {
      method: 'PATCH',
    });
  }

  async regenerateLineCode(lineId) {
    return this.request(`/lines/${lineId}/regenerate-code`, {
      method: 'POST',
    });
  }

  // Queue methods
  async joinLine(lineCode) {
    return this.request('/queue/join', {
      method: 'POST',
      body: JSON.stringify({ lineCode }),
    });
  }

  async getMyQueue() {
    return this.request('/queue/my-queue');
  }

  async getQueueEntry(entryId) {
    return this.request(`/queue/entry/${entryId}`);
  }

  async leaveLine(entryId) {
    return this.request(`/queue/entry/${entryId}/leave`, {
      method: 'PATCH',
    });
  }

  async getLineQueue(lineId, status = 'waiting') {
    return this.request(`/queue/line/${lineId}?status=${status}`);
  }

  async markAsVisited(entryId, notes = '') {
    return this.request(`/queue/entry/${entryId}/visited`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  async removeFromQueue(entryId, reason = '') {
    return this.request(`/queue/entry/${entryId}/remove`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getQueueStats(lineId) {
    return this.request(`/queue/line/${lineId}/stats`);
  }

  // Dashboard methods
  async getDashboardOverview() {
    return this.request('/dashboard/overview');
  }

  async getAnalytics(period = '7d') {
    return this.request(`/dashboard/analytics?period=${period}`);
  }

  async setupCreatorProfile(data) {
    return this.request('/dashboard/setup-creator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Subscription methods
  async getSubscriptionPlans() {
    return this.request('/subscription/plans');
  }

  async getCurrentSubscription() {
    return this.request('/subscription/current');
  }

  async createSubscription(plan) {
    return this.request('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async requestUpgrade(plan, paymentMethod, bankTransactionId) {
    return this.request('/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan, paymentMethod, bankTransactionId }),
    });
  }

  async cancelSubscription(cancelAtPeriodEnd = true) {
    return this.request('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
  }

  async getUsageStats() {
    return this.request('/subscription/usage');
  }

  async checkLimits(action) {
    return this.request(`/subscription/check/${action}`);
  }

  // Admin subscription methods
  async getAllSubscriptions(page = 1, limit = 20, status, plan) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (plan) params.append('plan', plan);
    return this.request(`/subscription/admin/all?${params}`);
  }

  async approveSubscription(subscriptionId, approved, notes) {
    return this.request(`/subscription/admin/${subscriptionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved, notes }),
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// ===== lib/utils.js =====
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Time formatting utilities
export function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function formatWaitTime(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Validation utilities
export function validatePhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function validateOTP(otp) {
  return /^\d{6}$/.test(otp);
}

export function validateLineCode(code) {
  return /^\d{6}$/.test(code);
}

// Storage utilities (with SSR safety)
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setStoredAuth(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// URL utilities
export function getJoinUrl(lineCode) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/join?code=${lineCode}`;
}

// Copy to clipboard
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

// Status color utilities
export function getStatusColor(status) {
  const colors = {
    waiting: 'bg-blue-100 text-blue-800',
    being_served: 'bg-yellow-100 text-yellow-800',
    visited: 'bg-green-100 text-green-800',
    left: 'bg-gray-100 text-gray-800',
    removed: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.waiting;
}

export function getAvailabilityColor(isAvailable) {
  return isAvailable 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
}

// ===== hooks/useAuth.js =====
import { useState, useEffect } from 'react';
import { api, getStoredUser, getStoredToken, setStoredAuth, clearStoredAuth } from '@/lib/utils';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    setToken(storedToken);
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (phone, otp, name) => {
    try {
      setError(null);
      const response = await api.verifyOTP(phone, otp, name);
      
      setToken(response.token);
      setUser(response.user);
      setStoredAuth(response.token, response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };
}

// ===== hooks/useLocalStorage.js =====
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
