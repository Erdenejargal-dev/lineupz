'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Users, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const featuresRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          gsap.fromTo('.feature-card', {
            y: 60,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
            }
          });

          gsap.fromTo('.calendar-demo', {
            x: 50,
            opacity: 0
          }, {
            x: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: calendarRef.current,
              start: 'top 70%',
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
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen">
        <div className="mb-8">
          <SplitText className="text-5xl text-slate-900 tracking-tighter font-medium">
            Let's get in queue
          </SplitText>
          <SplitText className="tracking-tight text-slate-800 text-xl">
            Save your time.
          </SplitText>
        </div>
        <QuickJoinForm />
        <div className="mt-4">
          <Link 
            href="/dashboard" 
            className="text-slate-800 hover:text-slate-600 underline underline-offset-4 transition-colors"
          >
            Click here to create a lining
          </Link>
        </div>
      </main>

      {/* What is Tabi - Simple */}
      <section ref={featuresRef} className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Smart appointment booking for businesses
          </h2>
          <p className="text-xl text-slate-600 mb-16 max-w-3xl mx-auto">
            Tabi is the modern appointment platform that connects businesses with their customers. 
            From beauty salons to medical clinics, we make scheduling simple and efficient.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Online Appointments</h3>
              <p className="text-slate-600">
                Customers book appointments online with real-time availability and instant confirmations.
              </p>
            </div>
            
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Digital Queues</h3>
              <p className="text-slate-600">
                Eliminate waiting rooms with smart digital queues that keep customers informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Calendar Integration */}
      <section ref={calendarRef} className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Google Calendar Integration
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Sync with your Google Calendar
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Tabi automatically syncs all appointments with your Google Calendar, 
                keeping your schedule organized and sending reminders to both you and your customers.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Automatic Sync</h4>
                    <p className="text-slate-600">All appointments appear in your Google Calendar instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Smart Reminders</h4>
                    <p className="text-slate-600">Google Calendar sends automatic reminders to reduce no-shows</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Conflict Prevention</h4>
                    <p className="text-slate-600">Prevents double-booking by checking your existing calendar</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="calendar-demo">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-slate-900">Google Calendar</span>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">Hair Appointment</h4>
                      <span className="text-sm text-slate-500">2:00 PM</span>
                    </div>
                    <p className="text-sm text-slate-600">Sarah Johnson • Beauty Salon</p>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">Dental Checkup</h4>
                      <span className="text-sm text-slate-500">4:30 PM</span>
                    </div>
                    <p className="text-sm text-slate-600">Mike Chen • Dental Clinic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your appointments?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join businesses using Tabi to manage their bookings efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/creator-dashboard">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-medium">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg font-medium">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="flex justify-center py-4">
       
      </footer>
    </div>
  );
}
