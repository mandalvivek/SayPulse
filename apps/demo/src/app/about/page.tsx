'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">About Us</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-4">
            <span>✨ THE NEXTGEN MULTIVERSE STORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Capturing the Spoken Voice of Every Customer
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            SayPulse was built to eliminate &ldquo;Silent Churn.&rdquo; We transform unfiltered human voice into prioritized bug reports, sentiment telemetry, and engineering action items in milliseconds.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          {/* Section 1: The Problem — Silent Churn */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">💡</span>
              <span>The Problem: 25 Out of 26 Unhappy Users Never Speak Up</span>
            </h2>
            <p>
              Industry metrics reveal a painful truth in software engineering: <strong>only 1 out of 26 dissatisfied customers will take the effort to open a support ticket or type a 5-paragraph bug report</strong>. The remaining 25 simply leave, abandon their carts, or churn in complete silence.
            </p>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1325] border border-cyan-500/30 space-y-4">
              <div className="text-cyan-400 font-mono font-bold text-sm">
                🎙️ How SayPulse Bridges the Friction Gap:
              </div>
              <p className="text-slate-300 leading-relaxed">
                Typing text feedback on mobile or web requires high cognitive effort. Speaking out loud takes zero effort. By enabling a 1-tap voice note widget that automatically converts speech into structured engineering summaries with Gemini AI, SayPulse increases feedback collection rates by over <strong>340%</strong>.
              </p>
            </div>
          </section>

          {/* Section 2: NextGen Multiverse Ecosystem */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">🌐</span>
              <span>The NextGen Multiverse Ecosystem</span>
            </h2>
            <p>
              SayPulse is an autonomous innovation incubated and operated under <strong>NextGen Multiverse Enterprises</strong>, a technology holding enterprise pioneering zero-friction, privacy-first software products across education, enterprise productivity, and artificial intelligence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-white/10 space-y-2">
                <div className="text-2xl mb-1">🎙️</div>
                <div className="text-white font-bold text-base">SayPulse AI</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time voice intelligence, sentiment analytics, and 1-line client feedback SDKs for modern web applications.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-white/10 space-y-2">
                <div className="text-2xl mb-1">🎓</div>
                <div className="text-white font-bold text-base">NextGen ExamDesk</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  India&apos;s leading high-stakes examination and academic assessment portal with real-time proctoring and student feedback.
                </p>
              </div>

              <div id="tecton" className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-white/10 space-y-2">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-white font-bold text-base">Tecton Enterprise</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enterprise-grade feature store, distributed data orchestration, and real-time inference infrastructure.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Engineering Ethos */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">⚡</span>
              <span>Our Core Engineering Principles</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-bold text-white">1. Zero Friction First</div>
                <div className="text-slate-400">No mandatory friction, complicated hurdles, or multi-step forms before users can tell you what&apos;s broken.</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-bold text-white">2. Ephemeral Audio Privacy</div>
                <div className="text-slate-400">Raw voice is processed in transient memory and wiped immediately. Zero raw audio stored.</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-bold text-white">3. Shadow DOM Sandboxing</div>
                <div className="text-slate-400">The client widget is isolated from host CSS and JavaScript conflicts completely.</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="font-bold text-white">4. 100% Tenant Data Ownership</div>
                <div className="text-slate-400">Your customer conversations belong exclusively to you. Never sold or leased to third parties.</div>
              </div>
            </div>
          </section>

          {/* Section 4: Contact & Office */}
          <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0b1325] border border-cyan-500/30 space-y-3">
            <h3 className="text-lg font-bold text-white">Headquarters &amp; Global Operations</h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              NextGen Multiverse Enterprises Pvt Ltd is headquartered in New Delhi, India, with distributed engineering teams operating worldwide.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition"
              >
                <span>Talk to Solutions Engineering</span>
                <span>➔</span>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
