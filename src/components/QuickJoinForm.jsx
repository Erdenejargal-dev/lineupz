'use client'
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

export default function QuickJoinForm() {
  const [lineCode, setLineCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false); // background code existence check
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const lastSubmitRef = useRef(0);
  const checkControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced remote existence check when user finishes typing 6 digits
  useEffect(() => {
    setError('');
    setIsValid(false);

    if (checkControllerRef.current) {
      checkControllerRef.current.abort();
      checkControllerRef.current = null;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!lineCode || lineCode.length !== 6) {
      setChecking(false);
      return;
    }

    // Debounce so we don't fire immediately for accidental typing/paste
    setChecking(true);
    debounceTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      checkControllerRef.current = controller;

      fetch(`${API_BASE_URL}/lines/code/${lineCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setIsValid(false);
            setError(data?.message || 'Line not found');
          } else {
            setIsValid(true);
            setError('');
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setIsValid(false);
          setError('Network error while checking code');
        })
        .finally(() => {
          setChecking(false);
          checkControllerRef.current = null;
        });
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (checkControllerRef.current) {
        checkControllerRef.current.abort();
      }
    };
  }, [lineCode]);

  const handleJoin = async () => {
    // prevent double submits within 1s
    const now = Date.now();
    if (lastSubmitRef.current && now - lastSubmitRef.current < 1000) {
      setError('Please wait a moment before trying again.');
      return;
    }
    lastSubmitRef.current = now;

    if (!lineCode || lineCode.length !== 6) {
      setError('Please enter a valid 6-digit line code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/lines/code/${lineCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Line not found');
      }

      // success: redirect
      window.location.href = `/join?code=${lineCode}`;
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJoin();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label htmlFor="quickLineCode" className="block text-sm font-medium text-gray-700 mb-2">
            Join with Line Code
          </label>

          <div className="relative">
            <input
              id="quickLineCode"
              name="quickLineCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="6 digit line code"
              value={lineCode}
              onChange={(e) => {
                const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 6);
                setLineCode(digits);
                // optimistic local validity; remote check will set isValid once verified
                setIsValid(digits.length === 6 && !checking && !error);
              }}
              onKeyDown={handleKeyDown}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-mono tracking-widest pr-12"
              placeholder="123456"
              maxLength={6}
            />

            {/* Inline status indicator (right side of input) */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              {checking ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" aria-hidden />
              ) : isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" aria-hidden />
              ) : (
                <div className="h-5 w-5" /> // placeholder spacing
              )}
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || !lineCode || lineCode.length !== 6 || checking}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-disabled={loading || !lineCode || lineCode.length !== 6 || checking}
        >
          {loading ? 'Checking...' : 'Join Line'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Enter the 6-digit code from your line creator
        </p>
      </div>
    </div>
  );
}
