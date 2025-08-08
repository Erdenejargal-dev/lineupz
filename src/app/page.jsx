'use client';

import React, { useEffect, useRef } from 'react';
import QuickJoinForm from '@/components/QuickJoinForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { gsap } from 'gsap';

export default function Home() {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const ctasRef = useRef(null);
  const statsRef = useRef(null);
  const cardRef = useRef(null);
  const shapeARef = useRef(null);
  const shapeBRef = useRef(null);
  const illustrationRef = useRef(null);

  useEffect(() => {
    // Staggered entrance for headline, sub and CTAs
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      titleRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }
    )
      .fromTo(
        subRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 },
        '-=0.35'
      )
      .fromTo(
        ctasRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
        '-=0.35'
      )
      .fromTo(
        statsRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'
      );

    // Card entrance
    gsap.from(cardRef.current, { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.18 });

    // Gentle floating for background shapes (subtle, performant)
    gsap.to(shapeARef.current, {
      y: 24,
      x: -10,
      duration: 8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      opacity: 0.85
    });
    gsap.to(shapeBRef.current, {
      y: -18,
      x: 10,
      duration: 11,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      opacity: 0.7
    });

    // Illustration micro animations (stroke draw + subtle bob)
    const ill = illustrationRef.current;
    if (ill) {
      const paths = ill.querySelectorAll('path, circle, rect, line');
      paths.forEach((p) => {
        const length = p.getTotalLength ? p.getTotalLength() : 100;
        p.style.strokeDasharray = length;
        p.style.strokeDashoffset = length;
      });

      const drawTl = gsap.timeline({ delay: 0.5 });
      drawTl.to(paths, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.out',
        stagger: 0.06,
        onComplete: () => {
          // After draw, add a gentle scale + floating loop to the whole illustration
          gsap.to(ill, {
            y: -6,
            duration: 6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }
      });
    }

    return () => {
      tl.kill();
      gsap.killTweensOf([shapeARef.current, shapeBRef.current, cardRef.current, titleRef.current, subRef.current, ctasRef.current, statsRef.current, illustrationRef.current]);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <header className="relative overflow-hidden">
        {/* Background gradient + subtle shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-gradient-to-br from-[#0ea5e9] via-[#7c3aed] to-[#06b6d4]" />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <radialGradient id="r1" cx="20%" cy="15%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#r1)" />
          </svg>

          <div ref={shapeARef} className="pointer-events-none absolute -left-24 -top-20 w-[40rem] h-[40rem] rounded-full bg-white/8 blur-3xl transform rotate-6" />
          <div ref={shapeBRef} className="pointer-events-none absolute right-[-10rem] top-[8rem] w-[28rem] h-[28rem] rounded-full bg-white/6 blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7 text-white">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Quick Join — Top
                </div>

                <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg opacity-0">
                  Spend time serving, not managing the line.
                </h1>

                <p ref={subRef} className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8 opacity-0">
                  Tabi helps businesses reduce wait times, notify customers instantly, and run appointments seamlessly — all from a simple dashboard.
                </p>
              </div>

              <div ref={ctasRef} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center opacity-0">
                <Link href="/creator-dashboard" className="inline-flex">
                  <Button className="bg-white text-slate-900 px-6 py-3 rounded-lg shadow-lg">
                    Start Free Trial
                  </Button>
                </Link>

                <Link href="/dashboard" className="inline-flex">
                  <Button variant="outline" className="text-white border-white/30 px-5 py-3 rounded-lg flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </Button>
                </Link>

                <Link href="/pricing" className="ml-0 sm:ml-4 text-sm text-white/90 hover:underline mt-3 sm:mt-0">
                  Pricing & Plans <ArrowRight className="inline-block w-3 h-3 ml-1" />
                </Link>
              </div>

              <div ref={statsRef} className="mt-10 flex flex-wrap gap-6 text-sm text-white/85 opacity-0">
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
              </div>
            </div>

            {/* Right: Quick Join card + illustration */}
            <div className="lg:col-span-5">
              <div ref={cardRef} className="relative opacity-0">
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto ring-1 ring-black/5">
                  <div className="mb-4">
                    <h3 className="text-slate-900 font-semibold text-lg">Quick Join</h3>
                    <p className="text-sm text-slate-500">Enter a 6-digit line code to join instantly</p>
                  </div>

                  <QuickJoinForm />

                  <div className="mt-4 text-xs text-slate-500 text-center">
                    No code? <Link href="/join" className="text-slate-900 font-medium hover:underline">Browse lines</Link>
                  </div>
                </div>

                <div className="absolute -top-4 right-6 bg-white/10 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm">
                  Live demo
                </div>

                {/* Lightweight SVG illustration (animated via GSAP) */}
                <div className="absolute -left-10 -bottom-12 w-44 h-44 pointer-events-none" aria-hidden>
                  <svg ref={illustrationRef} viewBox="0 0 120 120" className="w-full h-full">
                    <rect x="8" y="12" width="104" height="96" rx="12" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2"/>
                    <circle cx="36" cy="36" r="8" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"/>
                    <path d="M24 72c8-6 24-6 36 0s20 10 28 6" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="24" y1="54" x2="96" y2="54" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M44 26c6 4 12 4 18 0" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-slate-900 mb-2">Queue Management</h4>
              <p className="text-sm text-slate-600">Real-time queue tracking and customer notifications with minimal setup.</p>
            </div>

            <div className="p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-slate-900 mb-2">Smart Scheduling</h4>
              <p className="text-sm text-slate-600">Seamless appointment booking with calendar sync and reminders.</p>
            </div>

            <div className="p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-slate-900 mb-2">Analytics</h4>
              <p className="text-sm text-slate-600">Track performance and improve customer experience with actionable insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Trusted by businesses across industries</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-slate-700 italic">"Tabi reduced our waiting room crowd by 70% — customers love the SMS updates."</p>
              <div className="mt-4 font-semibold">Dr. Batbayar — Erdenet Medical</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-slate-700 italic">"Simple to set up and it just works. Our salon is more organized than ever."</p>
              <div className="mt-4 font-semibold">Ms. Oyunaa — Bella Beauty</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-slate-700 italic">"Appointments and walk-ins handled in one place — game changer."</p>
              <div className="mt-4 font-semibold">Mr. Ganbold — UB Office</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to modernize your business?</h2>
          <p className="text-lg text-slate-200 mb-8">Start a free trial and see how Tabi reduces wait times and improves customer satisfaction.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/creator-dashboard">
              <Button className="bg-white text-slate-900 px-8 py-3 rounded-lg shadow-lg">Start Free Trial</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="text-white border-white/30 px-6 py-3 rounded-lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
