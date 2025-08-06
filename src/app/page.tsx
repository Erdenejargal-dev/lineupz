import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm';
import Header from "@/components/header"
import Link from "next/link";
import { Calendar, Clock, Users, Smartphone, CheckCircle, ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-50">
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

      {/* What is Tabi Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
              Modern appointment booking for everyone
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Tabi is the smart appointment booking platform that connects businesses with their customers. 
              From beauty salons to medical clinics, we make scheduling effortless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Scheduling</h3>
              <p className="text-slate-600 leading-relaxed">
                Intelligent appointment booking with real-time availability and automatic confirmations.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Queue Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Digital queues that eliminate waiting rooms and give customers real-time updates.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Mobile First</h3>
              <p className="text-slate-600 leading-relaxed">
                Beautiful mobile experience for both business owners and their customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Calendar Integration Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Google Calendar Integration
              </div>
              <h2 className="text-4xl font-semibold text-slate-900 mb-6 tracking-tight">
                Your calendar, perfectly synced
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Tabi integrates seamlessly with Google Calendar to keep your schedule organized and your customers informed. 
                Every appointment automatically appears in your calendar with all the details you need.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Automatic Sync</h4>
                    <p className="text-slate-600">All appointments instantly appear in your Google Calendar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Smart Reminders</h4>
                    <p className="text-slate-600">Google Calendar sends automatic reminders to you and your customers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Conflict Prevention</h4>
                    <p className="text-slate-600">Automatically detects scheduling conflicts across all your calendars</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900">Google Calendar</span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">Hair Cut Appointment</h4>
                      <span className="text-sm text-slate-500">2:00 PM</span>
                    </div>
                    <p className="text-sm text-slate-600">Customer: Sarah Johnson</p>
                    <p className="text-sm text-slate-600">📍 Beauty Salon Downtown</p>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">Dental Checkup</h4>
                      <span className="text-sm text-slate-500">4:30 PM</span>
                    </div>
                    <p className="text-sm text-slate-600">Customer: Mike Chen</p>
                    <p className="text-sm text-slate-600">📍 Smile Dental Clinic</p>
                  </div>
                  
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">Consultation Call</h4>
                      <span className="text-sm text-slate-500">6:00 PM</span>
                    </div>
                    <p className="text-sm text-slate-600">Customer: Alex Rivera</p>
                    <p className="text-sm text-slate-600">💻 Online Meeting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Businesses Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
              Trusted by businesses worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From solo practitioners to enterprise clinics, Tabi powers appointment booking for thousands of businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💄</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Beauty Salons</h3>
              <p className="text-slate-600 text-sm">Hair, nails, spa treatments</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Medical Clinics</h3>
              <p className="text-slate-600 text-sm">Doctors, dentists, specialists</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fitness Studios</h3>
              <p className="text-slate-600 text-sm">Personal training, yoga, pilates</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Consultants</h3>
              <p className="text-slate-600 text-sm">Legal, financial, coaching</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">10,000+</div>
              <div className="text-slate-600">Appointments booked monthly</div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
              <div className="text-slate-600">Active businesses</div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">99.9%</div>
              <div className="text-slate-600">Uptime reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">
            Ready to modernize your booking?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join thousands of businesses using Tabi to streamline their appointment booking and delight their customers.
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
          
          <div className="flex items-center justify-center gap-8 mt-12 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global Support</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex justify-center py-4">
       
      </footer>
    </div>
  );
}
