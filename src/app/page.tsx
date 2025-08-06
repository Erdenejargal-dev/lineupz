'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Clock, Users, Smartphone, CheckCircle, ArrowRight, Zap, Shield, Globe, Sparkles, Star, Play } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const calendarRef = useRef(null);
  const businessRef = useRef(null);

  useEffect(() => {
    // GSAP animations
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          // Hero floating animation
          gsap.to('.hero-float', {
            y: -20,
            duration: 2,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
          });

          // Features cards animation
          gsap.fromTo('.feature-card', {
            y: 100,
            opacity: 0,
            scale: 0.8
          }, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
            }
          });

          // Calendar integration animation
          gsap.fromTo('.calendar-mockup', {
            x: 100,
            opacity: 0,
            rotateY: 15
          }, {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: calendarRef.current,
              start: 'top 70%',
            }
          });

          // Business icons animation
          gsap.fromTo('.business-icon', {
            scale: 0,
            rotation: 180
          }, {
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: businessRef.current,
              start: 'top 80%',
            }
          });

          // Parallax background elements
          gsap.to('.parallax-slow', {
            yPercent: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });

          gsap.to('.parallax-fast', {
            yPercent: -100,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        } catch (error) {
          console.log('GSAP not available, skipping animations');
        }
      }
    };

    initAnimations();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        <div className="parallax-slow absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="parallax-fast absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="parallax-slow absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section - Enhanced */}
      <main ref={heroRef} className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen">
        <div className="hero-float mb-8">
          <div className="relative">
            <SplitText className="text-6xl md:text-8xl text-white tracking-tighter font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Let's get in queue
            </SplitText>
            <div className="absolute -top-4 -right-4 text-yellow-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <SplitText className="tracking-tight text-gray-300 text-2xl mt-4 font-light">
            Save your time. <span className="text-blue-400">Beautifully.</span>
          </SplitText>
        </div>
        
        <div className="relative z-20">
          <QuickJoinForm />
        </div>
        
        <div className="mt-8">
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium"
          >
            <span className="relative">
              Click here to create a lining
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* What is Tabi Section - Redesigned */}
      <section ref={featuresRef} className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full mb-8">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Modern Appointment Booking</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Tabi transforms
              </span>
              <br />
              <span className="text-white">how you book</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              The intelligent appointment platform connecting businesses with customers. 
              From beauty salons to medical clinics, we make scheduling <span className="text-blue-400 font-semibold">effortless</span>.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Scheduling</h3>
                <p className="text-gray-300 leading-relaxed">
                  AI-powered appointment booking with real-time availability, intelligent conflict detection, and automatic confirmations.
                </p>
                <div className="mt-6 flex items-center text-blue-400 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            <div className="feature-card group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Queue Management</h3>
                <p className="text-gray-300 leading-relaxed">
                  Digital queues that eliminate waiting rooms, provide real-time updates, and create delightful customer experiences.
                </p>
                <div className="mt-6 flex items-center text-green-400 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            <div className="feature-card group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mobile First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Stunning mobile experience designed for both business owners and customers, with native app performance.
                </p>
                <div className="mt-6 flex items-center text-purple-400 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Calendar Integration - Redesigned */}
      <section ref={calendarRef} className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full mb-8">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Google Calendar Integration</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
                Your calendar,
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  perfectly synced
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Tabi integrates seamlessly with Google Calendar to keep your schedule organized and your customers informed. 
                Every appointment automatically appears with all the details you need.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Automatic Sync</h4>
                    <p className="text-gray-300">All appointments instantly appear in your Google Calendar with rich details and customer information</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Smart Reminders</h4>
                    <p className="text-gray-300">Google Calendar sends automatic reminders to you and your customers, reducing no-shows</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Conflict Prevention</h4>
                    <p className="text-gray-300">Automatically detects scheduling conflicts across all your calendars and prevents double-booking</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="calendar-mockup relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Google Calendar</span>
                  <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/30 p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white text-lg">Hair Cut Appointment</h4>
                      <span className="text-blue-300 font-medium">2:00 PM</span>
                    </div>
                    <p className="text-blue-200 text-sm mb-1">👤 Sarah Johnson</p>
                    <p className="text-blue-200 text-sm">📍 Beauty Salon Downtown</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-400/30 p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white text-lg">Dental Checkup</h4>
                      <span className="text-green-300 font-medium">4:30 PM</span>
                    </div>
                    <p className="text-green-200 text-sm mb-1">👤 Mike Chen</p>
                    <p className="text-green-200 text-sm">📍 Smile Dental Clinic</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-400/30 p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white text-lg">Consultation Call</h4>
                      <span className="text-purple-300 font-medium">6:00 PM</span>
                    </div>
                    <p className="text-purple-200 text-sm mb-1">👤 Alex Rivera</p>
                    <p className="text-purple-200 text-sm">💻 Online Meeting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Businesses Section */}
      <section ref={businessRef} className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full mb-8">
              <Globe className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Trusted Worldwide</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                Powering businesses
              </span>
              <br />
              <span className="text-white">everywhere</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              From solo practitioners to enterprise clinics, Tabi powers appointment booking for thousands of businesses across the globe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="business-icon text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl">💄</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Beauty Salons</h3>
              <p className="text-gray-400 text-sm">Hair, nails, spa treatments</p>
            </div>
            
            <div className="business-icon text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl">🏥</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Medical Clinics</h3>
              <p className="text-gray-400 text-sm">Doctors, dentists, specialists</p>
            </div>
            
            <div className="business-icon text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl">💪</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fitness Studios</h3>
              <p className="text-gray-400 text-sm">Personal training, yoga, pilates</p>
            </div>
            
            <div className="business-icon text-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-400/20 to-violet-400/20 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl">💼</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Consultants</h3>
              <p className="text-gray-400 text-sm">Legal, financial, coaching</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center group-hover:bg-white/10 transition-all duration-500">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">10,000+</div>
                <div className="text-gray-300">Appointments booked monthly</div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center group-hover:bg-white/10 transition-all duration-500">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-300">Active businesses</div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center group-hover:bg-white/10 transition-all duration-500">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">99.9%</div>
                <div className="text-gray-300">Uptime reliability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-black"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Ready to Transform?</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Modernize your booking
            </span>
            <br />
            <span className="text-white">experience today</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join thousands of businesses using Tabi to streamline their appointment booking and delight their customers with seamless experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/creator-dashboard">
              <Button className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-12 text-gray-400 text-sm">
            <div className="flex items-center gap-2 group">
              <Shield className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Zap className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Globe className="w-5 h-5 group-hover:text-green-400 transition-colors" />
              <span>Global Support</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex justify-center py-8 border-t border-white/10">
        <div className="text-gray-500 text-sm">
          © 2024 Tabi. Transforming appointments, beautifully.
        </div>
      </footer>
    </div>
  );
}
