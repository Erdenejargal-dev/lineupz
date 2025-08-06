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
      {/* Hero Section - Enatega Style */}
      <main ref={heroRef} className="relative flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen overflow-hidden">
        <div className="hero-bg absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-10 -z-10"></div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
        
        <div className="mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
            <Zap className="w-4 h-4" />
            Smart Queue Management
          </div>
          
          <SplitText className="text-6xl md:text-8xl text-slate-900 tracking-tight font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Let's get in queue
          </SplitText>
          <SplitText className="text-2xl md:text-3xl text-slate-600 font-medium mb-8">
            Save your time. Skip the wait.
          </SplitText>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-slate-700 font-medium">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-slate-700 font-medium">Location Based</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Bell className="w-5 h-5 text-purple-500" />
              <span className="text-slate-700 font-medium">Smart Notifications</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mb-8">
          <QuickJoinForm />
        </div>
        
        <div className="relative z-10">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 text-lg font-semibold transition-all duration-300 hover:scale-105 group"
          >
            Create your own queue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Section 1 - Video Carousel (Enatega Style) */}
      <section ref={videoRef} className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="video-content max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Play className="w-4 h-4" />
              See Tabi in Action
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Experience the
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Future of Queuing
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transform your business with smart digital queues, real-time notifications, and seamless customer experiences.
            </p>
          </div>
          
          <VideoCarousel />
        </div>
      </section>

      {/* Section 2 - Get to know Tabi (Enatega Style) */}
      <section ref={featuresRef} className="py-24 px-4 bg-gradient-to-br from-white via-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Star className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Get to know
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tabi.
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage queues, appointments, and customer experiences in one powerful platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Google Calendar Integration */}
            <div className="feature-card group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-2 min-h-[500px] flex flex-col">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    Google Calendar
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    Perfect Calendar Sync
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Every appointment automatically syncs with Google Calendar. Smart reminders, conflict prevention, and seamless scheduling.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-slate-900">Hair Appointment</span>
                    <span className="ml-auto text-blue-600 font-semibold">2:00 PM</span>
                  </div>
                  <p className="text-sm text-slate-600">Sarah Johnson • Beauty Salon</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Synced & Confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Scheduling */}
            <div className="feature-card group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-green-200 hover:-translate-y-2 min-h-[500px] flex flex-col">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    Smart Scheduling
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors">
                    Intelligent Booking
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Real-time availability, instant confirmations, and AI-powered scheduling optimization for any business type.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-slate-900">Available Now</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-semibold text-sm">Live</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium">2:00 PM</div>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium">3:30 PM</div>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium">5:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Queues */}
            <div className="feature-card group">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-purple-200 hover:-translate-y-2 min-h-[500px] flex flex-col">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    Digital Queues
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">
                    Skip the Wait
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Eliminate physical waiting rooms with smart digital queues that keep customers informed and engaged.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-slate-900">Your Position</span>
                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-lg font-bold">#3</div>
                  </div>
                  <p className="text-slate-600 mb-3">Estimated wait: 15 minutes</p>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Tabi Essentials (Enatega Style) */}
      <section ref={essentialsRef} className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Shield className="w-4 h-4" />
              Essential Tools
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Tabi
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                essentials.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to transform your business operations and customer experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Google Calendar */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Google Calendar</h3>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    Sync it up. Never miss it. Perfect integration with your existing workflow.
                  </p>
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Learn more
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Experience */}
            <div className="essential-item group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Mobile Experience</h3>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    Book it anywhere. Manage it everywhere. Beautiful responsive design.
                  </p>
                  <Link 
                    href="/creator-dashboard" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Try it now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
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
