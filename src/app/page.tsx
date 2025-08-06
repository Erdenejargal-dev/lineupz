'use client';

import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Users, ArrowRight, Play, Smartphone, Clock } from "lucide-react";
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);

  useEffect(() => {
    const initAnimations = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { gsap } = await import('gsap');
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          
          gsap.registerPlugin(ScrollTrigger);

          // Hero parallax
          gsap.to('.hero-bg', {
            yPercent: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });

          // Section 1 - Scale and fade
          gsap.fromTo('.section1-content', {
            scale: 0.8,
            opacity: 0
          }, {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section1Ref.current,
              start: 'top 80%',
              end: 'center center',
              scrub: 1
            }
          });

          // Section 2 - Slide and reveal
          gsap.fromTo('.section2-video', {
            x: 100,
            opacity: 0
          }, {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section2Ref.current,
              start: 'top 70%',
            }
          });

          // Section 3 - Zoom effect
          gsap.fromTo('.section3-content', {
            scale: 1.2,
            opacity: 0
          }, {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section3Ref.current,
              start: 'top 80%',
              end: 'center center',
              scrub: 1
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
      {/* Hero Section */}
      <main ref={heroRef} className="relative flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen overflow-hidden">
        <div className="hero-bg absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
        <div className="mb-8 relative z-10">
          <SplitText className="text-6xl md:text-8xl text-slate-900 tracking-tighter font-light mb-4">
            Let's get in queue
          </SplitText>
          <SplitText className="tracking-tight text-slate-600 text-2xl font-light">
            Save your time.
          </SplitText>
        </div>
        <div className="relative z-10">
          <QuickJoinForm />
        </div>
        <div className="mt-6 relative z-10">
          <Link 
            href="/dashboard" 
            className="text-slate-700 hover:text-slate-900 text-lg font-light transition-colors"
          >
            Click here to create a lining →
          </Link>
        </div>
      </main>

      {/* Section 1 - Full Screen Video-like */}
      <section ref={section1Ref} className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-black opacity-90"></div>
        <div className="absolute inset-0">
          <div className="w-full h-full opacity-20 bg-gradient-to-br from-blue-500 to-purple-500"></div>
        </div>
        
        <div className="section1-content relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-6xl md:text-8xl font-light mb-8 tracking-tight leading-tight">
            Appointment booking.
            <br />
            <span className="font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
            Tabi transforms how businesses connect with customers. 
            Smart scheduling, digital queues, seamless experiences.
          </p>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                    <Play className="w-12 h-12 text-white ml-2" />
                  </div>
                  <p className="text-white text-xl font-light">See Tabi in action</p>
                </div>
              </div>
              
              <div className="absolute top-8 left-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">Smart Scheduling</span>
                </div>
              </div>
              
              <div className="absolute bottom-8 right-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">Digital Queues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Google Calendar Integration */}
      <section ref={section2Ref} className="relative min-h-screen flex items-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-6xl md:text-8xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
                Works with
                <br />
                <span className="font-medium text-blue-600">Google Calendar.</span>
              </h2>
              <p className="text-2xl text-gray-600 mb-12 font-light leading-relaxed">
                Every appointment syncs automatically. Smart reminders reduce no-shows. 
                Your schedule, perfectly organized.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-2xl font-light text-gray-900 mb-2">Automatic Sync</h4>
                    <p className="text-xl text-gray-600 font-light">Every booking appears instantly in your Google Calendar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-2xl font-light text-gray-900 mb-2">Smart Reminders</h4>
                    <p className="text-xl text-gray-600 font-light">Automatic notifications keep everyone informed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-2xl font-light text-gray-900 mb-2">Conflict Prevention</h4>
                    <p className="text-xl text-gray-600 font-light">Never double-book across your calendars</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section2-video">
              <div className="relative">
                <div className="aspect-[4/5] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium text-gray-900">Google Calendar</h3>
                        <p className="text-gray-500">Synced automatically</p>
                      </div>
                      <div className="ml-auto w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-400">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-xl font-medium text-gray-900">Hair Appointment</h4>
                          <span className="text-gray-500 font-medium">2:00 PM</span>
                        </div>
                        <p className="text-gray-600">Sarah Johnson • Beauty Salon</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>Reminder sent</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-400">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-xl font-medium text-gray-900">Dental Checkup</h4>
                          <span className="text-gray-500 font-medium">4:30 PM</span>
                        </div>
                        <p className="text-gray-600">Mike Chen • Dental Clinic</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          <span>Confirmed</span>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-400">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-xl font-medium text-gray-900">Consultation</h4>
                          <span className="text-gray-500 font-medium">6:00 PM</span>
                        </div>
                        <p className="text-gray-600">Alex Rivera • Online</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-purple-600">
                          <Smartphone className="w-4 h-4" />
                          <span>Video call ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - CTA */}
      <section ref={section3Ref} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        <div className="section3-content max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-6xl md:text-8xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
            Get started with
            <br />
            <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tabi today.
            </span>
          </h2>
          <p className="text-2xl text-gray-600 mb-16 font-light max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses transforming their appointment experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/creator-dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-6 text-xl font-medium rounded-full transition-all duration-300 hover:scale-105">
                Learn More
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-12 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                    <Calendar className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-3xl font-light text-gray-900 mb-4">Beautiful. Simple. Powerful.</h3>
                  <p className="text-xl text-gray-600 font-light">Experience the future of appointment booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-light">© 2024 Tabi. Transforming appointments.</p>
        </div>
      </footer>
    </div>
  );
}
