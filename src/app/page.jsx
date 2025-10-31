'use client';

import { Button } from "@/components/ui/button";
import QuickJoinForm from '@/components/QuickJoinForm';
import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  Users, 
  Clock, 
  BarChart3, 
  Star,
  CheckCircle,
  Smartphone,
  Bell,
  Calendar
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              100% Automated Queue Management
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-gray-900 mb-6 leading-tight">
            Add beautiful queue management
            <br />
            to any business
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Embed smart queues, appointments, and SMS notifications in seconds. Works perfectly with any business.{' '}
            <Link href="/creator-dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Get started for free!
            </Link>
          </p>

          {/* Platform Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Clinics</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Salons</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Offices</span>
            </div>
          </div>

          {/* Quick Join Form Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
              <QuickJoinForm />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-gray-600 mb-8">
            3,500+ businesses turn wait times into efficiency
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">50K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2M+</div>
              <div className="text-sm text-gray-600">Customers Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-blue-600 mb-2">PLATFORM OVERVIEW</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The most customizable and fastest
              <br />
              queue solution.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Avoid the headaches of manual queues and waiting rooms. Build a queue management system that works as efficiently as you imagined.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12 border border-blue-200">
              <div className="max-w-xl">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  All your favorite notification channels
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Showcase your queue status via SMS, email, push notifications and more.
                </p>
                <div className="flex gap-3 mb-8">
                  <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-blue-200">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-blue-200">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-blue-200">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Build a beautiful queue in seconds
              </h3>
              <p className="text-gray-600">
                Tabi is the only solution that gives you 100% control and flexibility over your queues, and your queue data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Built for modern businesses
              </h3>
              <p className="text-gray-600">
                Leverage powerful analytics and insights to optimize your operations and delight your customers!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Made for Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-2">MADE FOR NO-CODE</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Queue solutions for all businesses
            </h2>
          </div>

          {/* Tabs-style Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Walk-in Queues</h3>
              <p className="text-sm text-gray-600">
                Perfect for walk-in businesses with instant queue management.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Appointments</h3>
              <p className="text-sm text-gray-600">
                Schedule and manage appointments with automated reminders.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mobile-First</h3>
              <p className="text-sm text-gray-600">
                Beautiful mobile experience for both staff and customers.
              </p>
            </div>
          </div>

          {/* Feature Image */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-semibold text-blue-200 mb-2">NO CREDIT CARD REQUIRED</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Add unlimited queues for free
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/creator-dashboard">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl">
                    Try Tabi
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm"
                >
                  Product Tour
                </Button>
              </div>
              <p className="text-blue-100 text-sm">
                Free for up to 1,000 customers per month*
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-2">COMMON QUESTIONS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-2xl border border-gray-200 p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>What is Tabi?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Tabi is a modern queue management platform that helps businesses manage customer flow, reduce wait times, and improve customer satisfaction through automated queues and smart notifications.
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-gray-200 p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>Why use Tabi over other options?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Tabi offers real-time updates, SMS notifications, mobile-first design, and powerful analytics - all in one easy-to-use platform. Plus, it's free to start!
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-gray-200 p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>Is there a free trial?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! Tabi is completely free for up to 1,000 customers per month. No credit card required to get started.
              </p>
            </details>
          </div>

          <div className="text-center mt-8">
            <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
              View all FAQ's →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Business. Always Efficient
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Build beautiful queue management for your business
          </p>
          
          <Link href="/creator-dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
