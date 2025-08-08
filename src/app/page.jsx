'use client';

import QuickJoinForm from '@/components/QuickJoinForm';
import LiveStats from '@/components/LiveStats';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

export default function Home() {
  const [heroAnim, setHeroAnim] = useState(null);

  useEffect(() => {
    // Fetch a placeholder Lottie animation at runtime.
    // Replace this URL with a Solflare-specific Lottie JSON when you have it.
    const url = 'https://assets10.lottiefiles.com/packages/lf20_tfb3estd.json';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setHeroAnim(data))
      .catch(() => setHeroAnim(null));
  }, []);

  // Framer Motion variants
  const headingVariant = {
    hidden: { opacity: 0, y: 28 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.55, ease: 'easeOut' } }),
  };

  const cardVariant = {
    hidden: { opacity: 0, x: 40, scale: 0.98 },
    show: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.25, duration: 0.6, ease: 'easeOut' } },
  };

  const ctaVariant = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { delay: 0.28, duration: 0.45 } },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Solflare-like exact layout: gradient hero with animated shapes */}
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Main gradient (tuned for Solflare-like feel) */}
          <div className="h-full w-full bg-gradient-to-br from-[#0ea5e9] via-[#7c3aed] to-[#06b6d4] opacity-95"></div>

          {/* subtle overlay radial vignettes */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <radialGradient id="g1" cx="30%" cy="20%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <radialGradient id="g2" cx="85%" cy="80%" r="40%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)" />
            <rect width="100%" height="100%" fill="url(#g2)" />
          </svg>

          {/* Floating blurred circles for depth */}
          <div className="pointer-events-none absolute -left-32 -top-24 w-[48rem] h-[48rem] rounded-full bg-white/10 blur-3xl transform -rotate-12 animate-[float_12s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute right-[-12rem] top-[10rem] w-[32rem] h-[32rem] rounded-full bg-white/5 blur-2xl animate-[float_18s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left column: headline, subheading, CTAs */}
            <div className="lg:col-span-7 text-white">
              <motion.div initial="hidden" animate="show" custom={0} variants={headingVariant}>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Quick Join — Top
                </div>

                <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg" variants={headingVariant} custom={1}>
                  Manage your queues smarter.
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                    Faster, simpler, trusted.
                  </span>
                </motion.h1>

                <motion.p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8" variants={headingVariant} custom={2}>
                  Reduce wait times, notify customers instantly and focus on serving — not managing the line.
                </motion.p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center" initial="hidden" animate="show" variants={ctaVariant}>
                <Link href="/creator-dashboard" className="inline-flex">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-white text-slate-900 px-6 py-3 rounded-lg shadow-xl">
                      Start Free Trial
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/dashboard" className="inline-flex">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="text-white border-white/40 px-5 py-3 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Watch Demo
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/pricing" className="ml-0 sm:ml-4 text-sm text-white/90 hover:underline mt-3 sm:mt-0">
                  Pricing & Plans <ArrowRight className="inline-block w-3 h-3 ml-1" />
                </Link>
              </motion.div>

              {/* Trust / metrics small row */}
              <motion.div className="mt-10 flex flex-wrap gap-6 text-sm text-white/85" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">127+</span>
                  <span className="opacity-80">Active Lines</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">2.8K+</span>
                  <span className="opacity-80">Served Today</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">~12m</span>
                  <span className="opacity-80">Avg Wait</span>
                </div>
              </motion.div>
            </div>

            {/* Right column: QuickJoinForm placed prominently in the top section */}
            <div className="lg:col-span-5">
              <motion.div initial="hidden" animate="show" variants={cardVariant}>
                <div className="relative">
                  {/* Optional Lottie decorative animation behind the card */}
                  {heroAnim && (
                    <div className="absolute -right-10 -top-8 w-56 h-56 pointer-events-none -z-0 opacity-80">
                      <Lottie animationData={heroAnim} loop autoplay />
                    </div>
                  )}

                  {/* Card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto ring-1 ring-black/5">
                    <div className="mb-4">
                      <h3 className="text-slate-900 font-semibold text-lg">Quick Join</h3>
                      <p className="text-sm text-slate-500">Enter a 6-digit line code to join instantly</p>
                    </div>

                    {/* Quick join form component */}
                    <QuickJoinForm />

                    <div className="mt-4 text-xs text-slate-500 text-center">
                      No code? <Link href="/join" className="text-slate-900 font-medium hover:underline">Browse lines</Link>
                    </div>
                  </div>

                  {/* subtle badge */}
                  <div className="absolute -top-4 right-6 bg-white/10 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm">
                    Live demo
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature strip */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-2">Queue Management</h4>
              <p className="text-sm text-slate-600">Real-time queue tracking & customer notifications.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-2">Smart Scheduling</h4>
              <p className="text-sm text-slate-600">Automated appointments and calendar sync.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-2">Analytics</h4>
              <p className="text-sm text-slate-600">Track performance and customer satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <LiveStats />
        </div>
      </section>
    </div>
  );
}
