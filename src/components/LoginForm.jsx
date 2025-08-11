'use client'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OnboardingFlow from './OnboardingFlow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const LoginForm = () => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', or 'onboarding'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [returnTo, setReturnTo] = useState('');
  const [action, setAction] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get URL parameters
    const returnToParam = searchParams.get('returnTo');
    const actionParam = searchParams.get('action');
    
    if (returnToParam) {
      setReturnTo(returnToParam);
    }
    if (actionParam) {
      setAction(actionParam);
    }
  }, [searchParams]);

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setIsSignup(data.purpose === 'signup');
      setMessage(`OTP sent to ${phone}${process.env.NODE_ENV === 'development' ? ` (OTP: ${data.otp})` : ''}`);
      setStep('otp');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone, 
          otp,
          ...(isSignup && { name })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Check if user needs onboarding
      if (data.isNewUser || !data.user.onboardingCompleted) {
        setUser(data.user);
        setStep('onboarding');
      } else {
        // Redirect based on returnTo parameter or default to dashboard
        const redirectUrl = returnTo || '/dashboard';
        window.location.href = redirectUrl;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setError('');
    setMessage('');
    setIsSignup(false);
  };

  const handleOnboardingComplete = () => {
    // Redirect based on returnTo parameter or default to dashboard
    const redirectUrl = returnTo || '/dashboard';
    window.location.href = redirectUrl;
  };

  const handleOnboardingSkip = () => {
    // Redirect based on returnTo parameter or default to dashboard
    const redirectUrl = returnTo || '/dashboard';
    window.location.href = redirectUrl;
  };

  // Show onboarding flow if user needs it
  if (step === 'onboarding' && user) {
    return (
      <OnboardingFlow
        user={user}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            {step === 'phone' ? 'Sign in to Tabi' : 'Verify your phone'}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {step === 'phone' 
              ? 'Enter your phone number to get started'
              : `Enter the code sent to ${phone}`
            }
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10"
                placeholder="+1234567890"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <button
              onClick={sendOTP}
              disabled={loading || !phone}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Your Name (Optional)
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-center text-2xl font-mono tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 border border-input text-sm font-medium rounded-lg text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              >
                Back
              </button>
              <button
                onClick={verifyOTP}
                disabled={loading || !otp}
                className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to receive SMS messages for authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
