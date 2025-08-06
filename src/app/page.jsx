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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Hero Section */}
      <main ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Zap className="w-4 h-4" />
                Next-Gen Queue Management
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Skip the wait,
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  embrace efficiency
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Transform your business with intelligent queue management. Real-time updates, smart notifications, and seamless customer experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/creator-dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    Join a Queue
                    <Users className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">10K+</div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
                  <div className="text-sm text-slate-600">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">99.9%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Demo */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Join Demo</h3>
                  <p className="text-slate-600 text-sm">Experience our queue system in action</p>
                </div>
                
                <QuickJoinForm />
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span>Current queue status</span>
                    <span className="text-green-600 font-semibold">Live</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Dr. Smith's Clinic</div>
                        <div className="text-sm text-slate-600">3 people ahead • ~15 min wait</div>
                      </div>
                      <div className="text-green-600 text-sm font-semibold">Active</div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg opacity-60">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Bella's Salon</div>
                        <div className="text-sm text-slate-600">7 people ahead • ~30 min wait</div>
                      </div>
                      <div className="text-slate-500 text-sm">Waiting</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Your turn is next!</div>
                    <div className="text-xs text-slate-600">Dr. Smith's Clinic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Section 1 - Live Demos (Enatega Style) */}
      <section ref={videoRef} className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        </div>
        
        <div className="video-content max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Play className="w-4 h-4" />
              Check Out Our Live Demos
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Preview the complete
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                queue experience
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Customer, Business Owner & Admin dashboards in action!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Customer App */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 group">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Customer Dashboard</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Join queues, track position, and manage appointments seamlessly.
                </p>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Business Owner App */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 group">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">2. Business Dashboard</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Manage queues, appointments, and customer interactions.
                </p>
                <Link 
                  href="/creator-dashboard" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 group md:col-span-2 lg:col-span-1">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Admin Panel</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Complete platform management and analytics dashboard.
                </p>
                <Link 
                  href="/pricing" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Use Cases (Enatega Style) */}
      <section ref={featuresRef} className="py-24 px-4 bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Star className="w-4 h-4" />
              Use Cases
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Beyond Queues:
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                A Smarter Way to Serve
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              More than just a queue management platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Healthcare */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Healthcare</h3>
                <p className="text-slate-600 text-sm">Patient appointments and clinic queue management</p>
              </div>
            </div>

            {/* Restaurants */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-green-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Restaurants</h3>
                <p className="text-slate-600 text-sm">Table reservations and waiting list management</p>
              </div>
            </div>

            {/* Beauty Salons */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Beauty Salons</h3>
                <p className="text-slate-600 text-sm">Appointment booking and service scheduling</p>
              </div>
            </div>

            {/* Government Services */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-orange-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Government</h3>
                <p className="text-slate-600 text-sm">Public service appointments and citizen queues</p>
              </div>
            </div>

            {/* Banks */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Banks</h3>
                <p className="text-slate-600 text-sm">Customer service and teller queue management</p>
              </div>
            </div>

            {/* Retail Stores */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-teal-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Retail Stores</h3>
                <p className="text-slate-600 text-sm">Customer service and checkout optimization</p>
              </div>
            </div>

            {/* Educational */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-yellow-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Educational</h3>
                <p className="text-slate-600 text-sm">Student services and academic appointments</p>
              </div>
            </div>

            {/* Professional Services */}
            <div className="feature-card group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-rose-200 hover:-translate-y-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Professional</h3>
                <p className="text-slate-600 text-sm">Consultations and professional service booking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Features (Enatega Style) */}
      <section ref={essentialsRef} className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Shield className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              What's included?
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Absolutely everything.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to get a fast and efficient queue management system off the ground!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Queue Management */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Real-time Queue Management</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Live queue updates, position tracking, and instant notifications for seamless customer experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Calendar Integration */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Google Calendar Sync</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Automatic appointment synchronization with Google Calendar for perfect scheduling coordination.
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Notifications */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Smart Notifications</h3>
                  <p className="text-slate-300 leading-relaxed">
                    SMS, email, and in-app notifications to keep customers informed throughout their journey.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Responsive */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Mobile Responsive</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Beautiful, responsive design that works perfectly on all devices and screen sizes.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics & Insights */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Analytics & Insights</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Comprehensive analytics to track performance, customer satisfaction, and business metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Management */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Flexible Pricing</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Transparent pricing with no hidden fees. Scale your business with our flexible subscription plans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Ready to transform your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              business?
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Join thousands of businesses already using Tabi to streamline their operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/creator-dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-12 py-6 text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105">
                View Pricing
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Tabi</h3>
            <p className="text-slate-400">Transforming appointments, one queue at a time.</p>
          </div>
          <p className="text-slate-500">© 2024 Tabi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
