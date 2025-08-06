'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);

  useEffect(() => {
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          gsap.fromTo('.fade-up', {
            y: 40,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
              trigger: section1Ref.current,
              start: 'top 80%',
            }
          });

          gsap.fromTo('.slide-in', {
            x: 60,
            opacity: 0
          }, {
            x: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: section2Ref.current,
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
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen bg-gradient-to-b from-white to-gray-50">
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

      {/* Section 1 - What is Tabi (Apple style) */}
      <section ref={section1Ref} className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="fade-up text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight leading-tight">
              Appointment booking.
              <br />
              <span className="font-semibold">Reimagined.</span>
            </h2>
            <p className="fade-up text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Tabi is the modern appointment platform that connects businesses with their customers. 
              Simple, elegant, and powerful.
            </p>
          </div>
          
          {/* Large visual mockup area - Apple style */}
          <div className="fade-up relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-12 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Smart Scheduling</h3>
                      <p className="text-gray-600">Real-time availability</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Digital Queues</h3>
                      <p className="text-gray-600">No more waiting rooms</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Beautiful Interface</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Google Calendar Integration (Apple style) */}
      <section ref={section2Ref} className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="slide-in">
              <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
                Works with
                <br />
                <span className="font-semibold text-blue-600">Google Calendar.</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 font-light leading-relaxed">
                Seamlessly sync all your appointments. Automatic reminders. 
                Never miss a booking again.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Automatic Sync</h4>
                    <p className="text-gray-600">Every appointment appears instantly in your Google Calendar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Smart Reminders</h4>
                    <p className="text-gray-600">Reduce no-shows with automatic notifications</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Conflict Prevention</h4>
                    <p className="text-gray-600">Prevents double-booking across all your calendars</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="slide-in">
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-medium text-gray-900">Google Calendar</span>
                    <div className="ml-auto w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-2xl p-4 border-l-4 border-blue-400">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Hair Appointment</h4>
                        <span className="text-sm text-gray-500">2:00 PM</span>
                      </div>
                      <p className="text-sm text-gray-600">Sarah Johnson</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-2xl p-4 border-l-4 border-green-400">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Dental Checkup</h4>
                        <span className="text-sm text-gray-500">4:30 PM</span>
                      </div>
                      <p className="text-sm text-gray-600">Mike Chen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - CTA (Apple style) */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
            Get started with
            <br />
            <span className="font-semibold">Tabi today.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Join thousands of businesses streamlining their appointments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/creator-dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="flex justify-center py-8 bg-gray-50">
       
      </footer>
    </div>
  );
}
