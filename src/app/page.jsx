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
      <main ref={heroRef} className="pt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Join Line Section - First Thing Visible */}
          <div className="text-center mb-20">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join a Line Now
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have a 6-digit line code? Join instantly and skip the wait!
              </p>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                <QuickJoinForm />
              </div>
              
              <div className="mt-6">
                <Link href="/join" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Need more options? Visit our full join page →
                </Link>
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

          {/* Trusted By Section */}
          <div className="text-center mb-20">
            <p className="text-gray-500 text-sm mb-8">Trusted by leading businesses across Mongolia</p>
            <div className="flex items-center justify-center gap-12 opacity-60">
              <div className="text-gray-400 font-semibold">ERDENET CLINIC</div>
              <div className="text-gray-400 font-semibold">BELLA SALON</div>
              <div className="text-gray-400 font-semibold">MONGOL BANK</div>
              <div className="text-gray-400 font-semibold">UB HOSPITAL</div>
              <div className="text-gray-400 font-semibold">BLUE SKY</div>
            </div>
          </div>
        </div>
      </main>

      {/* Problem/Solution Section - Dark Background like Lawcus */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Say Goodbye to Tedious Queue Tasks
              <br />
              and <span className="text-blue-400">Hello to Enhanced Productivity</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Manual queue management</h3>
                  <p className="text-gray-300 text-sm">Time-consuming paper lists and verbal announcements</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Frustrated customers</h3>
                  <p className="text-gray-300 text-sm">Long waits without clear information or updates</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✗</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Lost revenue opportunities</h3>
                  <p className="text-gray-300 text-sm">Customers leaving due to poor queue experience</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8">
              <div className="bg-white rounded-lg p-6 mb-6">
                <QuickJoinForm />
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Live Demo
                </div>
              </div>
            </div>
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
