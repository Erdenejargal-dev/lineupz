'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Users, ArrowRight, Play, Smartphone, Clock, Star, Zap, Shield } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const featuresRef = useRef(null);
  const lineupRef = useRef(null);
  const essentialsRef = useRef(null);

  useEffect(() => {
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          // Hero parallax
          gsap.to('.hero-bg', {
            yPercent: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });

          // Video section animation
          gsap.fromTo('.video-content', {
            scale: 0.9,
            opacity: 0
          }, {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: videoRef.current,
              start: 'top 80%',
            }
          });

          // Feature cards stagger
          gsap.fromTo('.feature-card', {
            y: 60,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
            }
          });

          // Lineup cards animation
          gsap.fromTo('.lineup-card', {
            y: 80,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: lineupRef.current,
              start: 'top 80%',
            }
          });

          // Essentials animation
          gsap.fromTo('.essential-item', {
            scale: 0.8,
            opacity: 0
          }, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: essentialsRef.current,
              start: 'top 80%',
            }
          });

        } catch (error) {
          console.log('GSAP not available');
        }
      }
    };

    initAnimations();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Keep existing */}
      <main ref={heroRef} className="relative flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen overflow-hidden">
        <div className="hero-bg absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
        <div className="mb-8 relative z-10">
          <SplitText className="text-6xl md:text-7xl text-slate-900 tracking-tighter font-light mb-4">
            Let's get in queue
          </SplitText>
          <SplitText className="tracking-tight text-slate-600 text-2xl font-light">
            Save your time.
          </SplitText>
        </div>
        <div className="relative z-10">
          <QuickJoinForm />
        </div>
        <div className="mt-6 relative z-10">
          <Link 
            href="/dashboard" 
            className="text-slate-700 hover:text-slate-900 text-lg font-light transition-colors"
          >
            Click here to create a lining →
          </Link>
        </div>
      </main>

      {/* Section 1 - Video Section (Apple iPad style) */}
      <section ref={videoRef} className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="video-content max-w-7xl mx-auto px-4 text-center">
          {/* Large video-like mockup */}
          <div className="relative">
            <div className="aspect-video max-w-6xl mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              
              {/* Floating UI elements like iPad */}
              <div className="absolute top-8 left-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Smart Booking</span>
                </div>
                <p className="text-sm text-gray-600">Real-time scheduling</p>
              </div>
              
              <div className="absolute top-8 right-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Digital Queue</span>
                </div>
                <p className="text-sm text-gray-600">No more waiting</p>
              </div>
              
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Mobile First</span>
                </div>
                <p className="text-sm text-gray-600">Beautiful experience</p>
              </div>
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Get to know Tabi (Apple iPad style) */}
      <section ref={featuresRef} className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              Get to know Tabi.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Google Calendar Integration */}
            <div className="feature-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Google Calendar
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Sync with your calendar.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every appointment automatically appears in Google Calendar with smart reminders and conflict prevention.
                </p>
              </div>
              <div className="mt-8">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Hair Appointment</span>
                  </div>
                  <p className="text-sm text-gray-600">Sarah Johnson • 2:00 PM</p>
                </div>
              </div>
            </div>

            {/* Smart Scheduling */}
            <div className="feature-card bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Smart Scheduling
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Your business can be anywhere.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Real-time availability, instant confirmations, and intelligent booking management for any business type.
                </p>
              </div>
              <div className="mt-8">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Available Slots</span>
                    <span className="text-green-600 font-medium">Live</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">2:00 PM</div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">3:30 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Queues */}
            <div className="feature-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Digital Queues
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Take your queues digital.
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Eliminate waiting rooms with smart digital queues that keep customers informed and engaged.
                </p>
              </div>
              <div className="mt-8">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Queue Position</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">#3</span>
                  </div>
                  <p className="text-sm text-gray-600">Estimated wait: 15 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Explore the Plans (Apple iPad lineup style) */}
      <section ref={lineupRef} className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              Explore the plans.
            </h2>
            <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
              Compare all plans →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="lineup-card bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Free Plan</p>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-4">Perfect for getting started with appointment booking.</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">$0</p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>1 Queue</p>
                  <p>50 Customers/month</p>
                  <p>Basic features</p>
                </div>
                <Link href="/creator-dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="lineup-card bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-blue-700 font-medium">Most Popular</p>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">Advanced features for growing businesses.</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">$29/mo</p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>Unlimited Queues</p>
                  <p>500 Customers/month</p>
                  <p>Google Calendar sync</p>
                  <p>SMS notifications</p>
                </div>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="lineup-card bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-purple-700 font-medium">Enterprise</p>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">Complete solution for large organizations.</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">$99/mo</p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>Everything in Pro</p>
                  <p>Unlimited customers</p>
                  <p>Priority support</p>
                  <p>Custom integrations</p>
                </div>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Tabi Essentials (Apple iPad essentials style) */}
      <section ref={essentialsRef} className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              Tabi essentials.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Google Calendar */}
            <div className="essential-item text-center">
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Google Calendar</h3>
                  <p className="text-gray-600">Sync it up. Never miss it.</p>
                </div>
              </div>
              <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>

            {/* Mobile App */}
            <div className="essential-item text-center">
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-12 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <Smartphone className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Mobile Experience</h3>
                  <p className="text-gray-600">Book it anywhere. Manage it everywhere.</p>
                </div>
              </div>
              <Link href="/creator-dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                Try it now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-light">© 2024 Tabi. Transforming appointments.</p>
        </div>
      </footer>
    </div>
  );
}
