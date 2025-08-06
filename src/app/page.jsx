'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Users, ArrowRight, Play, Smartphone, Clock, Star, Zap, Shield, CheckCircle, MapPin, Bell } from "lucide-react";
import { useEffect, useRef } from 'react';
import VideoCarousel from '@/components/VideoCarousel';

export default function Home() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const featuresRef = useRef(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Simple Hero Section - Like Join Page */}
      <main ref={heroRef} className="pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          {/* Simple Headline */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-light text-black mb-4 tracking-tight">
              Queue Management
            </h1>
            <p className="text-lg md:text-xl font-light text-gray-600 mb-8">
              Simple. Elegant. Powerful.
            </p>
          </div>

          {/* Clean CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/creator-dashboard">
              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-base font-medium rounded-lg transition-all duration-200">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border border-gray-300 text-gray-700 hover:bg-white px-8 py-3 text-base font-medium rounded-lg transition-all duration-200">
                Join Queue
              </Button>
            </Link>
          </div>

          {/* Simple Demo Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <QuickJoinForm />
            </div>
          </div>
        </div>
      </main>

      {/* Apple-Style Demos Section */}
      <section ref={videoRef} className="relative py-32 bg-black overflow-hidden">
        <div className="video-content max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight">
              Three ways to experience
              <br />
              <span className="font-extralight text-gray-400">queue management.</span>
            </h2>
            <p className="text-xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Customer. Business. Admin.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer App */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-light text-white mb-4">Customer</h3>
                <p className="text-gray-400 mb-6 leading-relaxed font-light">
                  Join queues, track position, and manage appointments.
                </p>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  Try Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Business Owner App */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-light text-white mb-4">Business</h3>
                <p className="text-gray-400 mb-6 leading-relaxed font-light">
                  Manage queues, appointments, and customer interactions.
                </p>
                <Link 
                  href="/creator-dashboard" 
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  Try Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin Panel */}
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-light text-white mb-4">Admin</h3>
                <p className="text-gray-400 mb-6 leading-relaxed font-light">
                  Complete platform management and analytics.
                </p>
                <Link 
                  href="/pricing" 
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  Try Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apple-Style Use Cases */}
      <section ref={featuresRef} className="py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-light text-black mb-8 tracking-tight">
              Built for every
              <br />
              <span className="font-extralight text-gray-600">industry.</span>
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From healthcare to hospitality. From retail to government.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Healthcare */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Healthcare</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Patient appointments and clinic management</p>
              </div>
            </div>

            {/* Restaurants */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Restaurants</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Table reservations and waiting list management</p>
              </div>
            </div>

            {/* Beauty Salons */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Beauty Salons</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Appointment booking and service scheduling</p>
              </div>
            </div>

            {/* Government Services */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Government</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Public service appointments and citizen queues</p>
              </div>
            </div>

            {/* Banks */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Banks</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Customer service and teller queue management</p>
              </div>
            </div>

            {/* Retail Stores */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Retail Stores</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Customer service and checkout optimization</p>
              </div>
            </div>

            {/* Educational */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Educational</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Student services and academic appointments</p>
              </div>
            </div>

            {/* Professional Services */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:-translate-y-1 text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-black mb-3">Professional</h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed">Consultations and professional service booking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apple-Style Features Section */}
      <section ref={essentialsRef} className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight">
              Everything you need.
              <br />
              <span className="font-extralight text-gray-400">Nothing you don't.</span>
            </h2>
            <p className="text-xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed with simplicity in mind.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Queue Management */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Real-time Updates</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Live queue updates and position tracking for seamless customer experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Calendar Integration */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Calendar Sync</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Automatic synchronization with Google Calendar for perfect scheduling.
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Notifications */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Bell className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Smart Notifications</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    SMS, email, and in-app notifications to keep customers informed.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Responsive */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Smartphone className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Mobile First</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Beautiful, responsive design that works perfectly on all devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics & Insights */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Star className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Analytics</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Comprehensive insights to track performance and customer satisfaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Flexible Pricing */}
            <div className="essential-item group">
              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-light text-white mb-4">Flexible Pricing</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Transparent pricing with no hidden fees. Scale as you grow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apple-Style CTA Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-light text-black mb-8 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-xl font-light text-gray-600 mb-12 leading-relaxed">
            Join thousands of businesses already using Tabi.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/creator-dashboard">
              <Button className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg font-medium rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-12 py-4 text-lg font-medium rounded-full transition-all duration-300 hover:scale-[1.02]">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
