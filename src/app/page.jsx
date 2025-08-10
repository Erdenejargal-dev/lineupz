'use client';

import { Button } from "@/components/ui/button";
import QuickJoinForm from '@/components/QuickJoinForm';
import LiveStats from '@/components/LiveStats';
import Link from "next/link";
import { Calendar, Users, ArrowRight, Play, Smartphone, Clock, Star, Zap, Shield, CheckCircle, MapPin, Bell, BarChart3, MessageSquare, Globe, CreditCard, TrendingUp, Award, Lock } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Revolut Style */}
      <main ref={heroRef} className="pt-10 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Floating App Icons Background - Revolut Style */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500 rounded-2xl opacity-20 transform rotate-12"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500 rounded-xl opacity-15 transform -rotate-6"></div>
            <div className="absolute top-60 left-1/4 w-14 h-14 bg-green-500 rounded-2xl opacity-10 transform rotate-45"></div>
            <div className="absolute bottom-40 right-10 w-18 h-18 bg-orange-500 rounded-2xl opacity-20 transform -rotate-12"></div>
            <div className="absolute bottom-60 left-16 w-10 h-10 bg-pink-500 rounded-xl opacity-15 transform rotate-30"></div>
          </div>

          {/* Quick Join Section - Always at the top */}
          <div className="relative z-10 mb-16">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Quick Join
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join Your Line
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your 6-digit code to join instantly
                </p>
              </div>
              <QuickJoinForm />
            </div>
          </div>

          {/* Main Hero Content - Revolut Style */}
          <div className="relative z-10 text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span>Everyday essentials</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Queue, manage and grow
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">smarter</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Make day-to-day queue management a breeze with all things Tabi in one place
            </p>

            {/* CTA Button - Revolut Style */}
            <Link href="/creator-dashboard">
              <Button className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get a free account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Cards Section - Revolut Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Main Feature Card - Blue Gradient */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-24 translate-y-24"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                  Pay and get paid,
                  <br />
                  instantly
                </h3>
                <p className="text-blue-100 mb-8 text-lg">
                  Send money to friends, get paid by customers, and manage your business finances all in one place.
                </p>
                <Link href="/creator-dashboard">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold rounded-xl">
                    Explore easy payments →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Secondary Feature Cards */}
            <div className="space-y-8">
              {/* Interest Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Earn up to 0.7% annual
                  <br />
                  interest, paid daily
                </h3>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Interest paid</span>
                    <div className="text-lg font-semibold text-gray-900">+ £0.05</div>
                  </div>
                </div>
              </div>

              {/* Rewards Card */}
              <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Get exclusive Rewards
                  <br />
                  and save as you spend
                </h3>
                <div className="flex items-center gap-2 mt-6">
                  <Award className="w-5 h-5" />
                  <span className="text-pink-100">Premium benefits available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Icons Section - Revolut Style */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              All your business tools
              <br />
              <span className="text-blue-600">in one place</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From queue management to customer analytics, everything you need to run your business efficiently.
            </p>
          </div>

          {/* App Icons Grid - Revolut Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
            <div className="bg-blue-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="bg-green-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="bg-purple-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div className="bg-orange-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="bg-pink-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div className="bg-indigo-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="bg-yellow-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="bg-red-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="bg-teal-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="bg-cyan-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="bg-lime-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="bg-rose-500 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Live Stats Integration */}
          <div className="mb-16">
            <LiveStats />
          </div>
        </div>
      </section>

      {/* Business Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for modern
              <br />
              <span className="text-blue-600">businesses</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Queue Management */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Queue Management</h3>
              <p className="text-gray-600 mb-6">
                Real-time queue tracking, automated notifications, and intelligent wait time predictions.
              </p>
              <Link href="/creator-dashboard">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  Learn more →
                </Button>
              </Link>
            </div>

            {/* Analytics */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-6">
                Track performance, customer satisfaction, and business insights with detailed reports.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  View demo →
                </Button>
              </Link>
            </div>

            {/* Customer Experience */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Experience</h3>
              <p className="text-gray-600 mb-6">
                SMS notifications, real-time updates, and seamless mobile experience for your customers.
              </p>
              <Link href="/join">
                <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                  Try it out →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Revolut Style */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by businesses
              <br />
              <span className="text-blue-400">worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Active businesses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">2M+</div>
              <div className="text-gray-400">Customers served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">Uptime guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9★</div>
              <div className="text-gray-400">Customer rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Revolut Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What our customers
              <br />
              <span className="text-blue-600">are saying</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Tabi transformed our clinic operations. Patient wait times reduced by 60% and satisfaction scores are at an all-time high."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DB</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Batbayar</div>
                  <div className="text-gray-600 text-sm">Erdenet Medical Center</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The SMS notifications are a game-changer. Our customers love knowing exactly when to arrive. No more crowded waiting rooms!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MO</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ms. Oyunaa</div>
                  <div className="text-gray-600 text-sm">Bella Beauty Salon</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Streamlined our citizen services completely. Much more organized, efficient, and our staff can focus on helping people instead of managing queues."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MG</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mr. Ganbold</div>
                  <div className="text-gray-600 text-sm">UB Government Office</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Revolut Style */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to revolutionize
            <br />
            your business?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join thousands of businesses already using Tabi to streamline their operations and delight their customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/creator-dashboard">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get started for free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-12 py-4 text-xl font-semibold rounded-2xl transition-all duration-300">
                View pricing
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-300" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-300" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
