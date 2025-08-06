'use client';

import { Button } from "@/components/ui/button";
import QuickJoinForm from '@/components/QuickJoinForm';
import LiveStats from '@/components/LiveStats';
import Link from "next/link";
import { Calendar, Users, ArrowRight, Play, Smartphone, Clock, Star, Zap, Shield, CheckCircle, MapPin, Bell, BarChart3, MessageSquare, Globe } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Lawcus Style */}
      <main ref={heroRef} className="pt-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Join Line Section - Mobile-First Hero */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            {/* Mobile-First Container */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-blue-100">
              {/* Header Section */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Quick Join
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  Join a Line
                  <br className="hidden sm:block" />
                  <span className="text-blue-600"> Instantly</span>
                </h2>
                
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
                  Have a 6-digit line code? Skip the wait and join your queue in seconds!
                </p>
              </div>

              {/* Main Join Form Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto mb-6 sm:mb-8">
                <QuickJoinForm />
              </div>

              {/* Additional Options */}
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Instant notifications</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Real-time updates</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>No app required</span>
                  </div>
                </div>
                
                <div className="pt-2 sm:pt-4 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    Don't have a line code?
                  </p>
                  <Link 
                    href="/join" 
                    className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base transition-colors duration-200 hover:underline"
                  >
                    <span>Explore all available lines</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>

              {/* Mobile Stats Preview */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8 lg:hidden">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">127+</div>
                  <div className="text-xs text-gray-600">Active Lines</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-green-600">2.8K+</div>
                  <div className="text-xs text-gray-600">Served Today</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-purple-600">~12min</div>
                  <div className="text-xs text-gray-600">Avg Wait</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Focus on your Clients, Let
              <br />
              <span className="text-blue-600">Tabi Handle the Rest!</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Streamline your queue management with smart automation. 
              Reduce wait times, increase satisfaction, and grow your business.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/creator-dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-16">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid - Like Lawcus */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Queue Management</h3>
              <p className="text-gray-600 text-sm">Real-time queue tracking and customer notifications</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600 text-sm">Automated appointment booking and calendar sync</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SMS Notifications</h3>
              <p className="text-gray-600 text-sm">Keep customers informed with automated updates</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">Track performance and customer satisfaction</p>
            </div>
          </div>

          {/* Live Stats Section */}
          <div className="mb-20">
            <LiveStats />
          </div>

        </div>
      </main>

      {/* Modern Feature Showcase Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Ready to Run your Business
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Better</span> with us
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your queue management with smart automation that delights customers and streamlines operations.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Feature Card - Spans 2 columns on desktop */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">Smart Queue Management</h3>
                      <p className="text-blue-100 text-sm sm:text-base">Real-time automation at your fingertips</p>
                    </div>
                  </div>
                  
                  <p className="text-blue-50 mb-8 text-sm sm:text-base leading-relaxed">
                    Eliminate manual processes with intelligent queue tracking, automated notifications, and seamless customer experiences.
                  </p>
                  
                  <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6">
                    <QuickJoinForm />
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Live Demo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Feature Cards */}
            <div className="space-y-6 lg:space-y-8">
              {/* Live Chat Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">Live Support</h3>
                  <p className="text-purple-100 text-sm sm:text-base mb-6 leading-relaxed">
                    Get instant help from our support team whenever you need assistance.
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200">
                      Get Help
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Demo Card */}
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">Watch Demo</h3>
                  <p className="text-green-100 text-sm sm:text-base mb-6 leading-relaxed">
                    See how Tabi transforms your business operations in just 2 minutes.
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200">
                      Watch Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16 lg:mt-20">
            <Link href="/creator-dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Like Lawcus */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Save Time, Boost Productivity,
              <br />
              and <span className="text-green-400">Streamline your Workflow</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-900">30%</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reduce Wait Times</h3>
              <p className="text-gray-400">Average reduction in customer wait times with smart queue management</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">5</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hours Saved Daily</h3>
              <p className="text-gray-400">Time saved on manual queue management and customer communication</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">20%</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Increase Revenue</h3>
              <p className="text-gray-400">Revenue increase through improved customer satisfaction and retention</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tabi Helping Customers Save Time,
              <br />
              <span className="text-blue-600">Boost Efficiency, and Track Conversions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h4 className="font-semibold text-gray-900 mb-1">Dr. Batbayar</h4>
              <p className="text-gray-600 text-sm mb-3">Erdenet Medical Center</p>
              <p className="text-gray-700 text-sm italic">"Reduced patient wait times by 60% and improved satisfaction significantly."</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h4 className="font-semibold text-gray-900 mb-1">Ms. Oyunaa</h4>
              <p className="text-gray-600 text-sm mb-3">Bella Beauty Salon</p>
              <p className="text-gray-700 text-sm italic">"Our customers love the SMS notifications. No more crowded waiting rooms!"</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h4 className="font-semibold text-gray-900 mb-1">Mr. Ganbold</h4>
              <p className="text-gray-600 text-sm mb-3">UB Government Office</p>
              <p className="text-gray-700 text-sm italic">"Streamlined our citizen services. Much more organized and efficient now."</p>
            </div>

            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to transform your business?</h3>
              <p className="mb-6">Join hundreds of businesses already using Tabi to streamline their operations.</p>
              <Link href="/creator-dashboard">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold rounded-lg w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All-in-One Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your All-in-One Solution for Seamless
              <br />
              <span className="text-blue-600">Queue Management</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-gray-400 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <p>Queue Management Dashboard</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Everything you need in one platform</h3>
                <p className="text-gray-600 mb-6">
                  From queue management to customer notifications, analytics to appointment scheduling - 
                  Tabi provides all the tools you need to run your business efficiently.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Real-time queue management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Automated SMS notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Calendar integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Analytics and reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Mobile-friendly interface</span>
                </div>
              </div>

              <Link href="/creator-dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Integrated with All Your
            <br />
            <span className="text-blue-600">Favourite Apps</span>
          </h2>
          <p className="text-xl text-gray-600 mb-16">
            Seamlessly connect with the tools you already use
          </p>

          {/* Integration Icons Grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center opacity-60">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>


      {/* Final CTA Section - Dark */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get Started in 30 Seconds
            <br />
            <span className="text-blue-400">Free for 7 Days</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            No credit card required. Start managing your queues smarter today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/creator-dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-12 py-4 text-xl font-semibold rounded-lg transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
