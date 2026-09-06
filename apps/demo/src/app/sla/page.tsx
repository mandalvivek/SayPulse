'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function ServiceLevelAgreementPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Enterprise SLA</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-4">
            <span>⏱️ 99.99% ENTERPRISE UPTIME COMMITMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Enterprise Service Level Agreement (SLA)
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Detailed performance benchmarks, latency limits, uptime commitments, and financial service credits for high-throughput enterprise voice feedback deployments.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-400 font-mono">
            <div><strong className="text-slate-300">Target Uptime:</strong> 99.99% Edge CDN</div>
            <div>•</div>
            <div><strong className="text-slate-300">AI Latency:</strong> &lt; 1.5s Median Synthesis</div>
            <div>•</div>
            <div><strong className="text-slate-300">P1 Response:</strong> &lt; 15 Minutes</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          {/* Section 1: Uptime Matrix */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">1.</span>
              <span>Platform Uptime Guarantees</span>
            </h2>
            <p>
              NextGen Multiverse guarantees the following availability metrics across SayPulse production services:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-slate-200 font-mono">
                  <tr>
                    <th className="p-3.5">Service Layer</th>
                    <th className="p-3.5">Target SLA</th>
                    <th className="p-3.5">Max Monthly Downtime</th>
                    <th className="p-3.5">Redundancy Architecture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Universal Script CDN (saypulse.min.js)</td>
                    <td className="p-3.5 text-emerald-400 font-bold">99.99%</td>
                    <td className="p-3.5">&lt; 4.3 mins / mo</td>
                    <td className="p-3.5 text-slate-400">Multi-Region Cloudflare CDN Edge</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Synthesis API Gateway (/saypulse/v1/*)</td>
                    <td className="p-3.5 text-emerald-400 font-bold">99.95%</td>
                    <td className="p-3.5">&lt; 21.6 mins / mo</td>
                    <td className="p-3.5 text-slate-400">Auto-Scaling Container Instances</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Authentication &amp; Access Gateway</td>
                    <td className="p-3.5 text-cyan-400 font-bold">99.90%</td>
                    <td className="p-3.5">&lt; 43.2 mins / mo</td>
                    <td className="p-3.5 text-slate-400">Dual Webhook + Email Fallback</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Admin Dashboard &amp; Analytics Feed</td>
                    <td className="p-3.5 text-cyan-400 font-bold">99.90%</td>
                    <td className="p-3.5">&lt; 43.2 mins / mo</td>
                    <td className="p-3.5 text-slate-400">Next.js Edge Cluster</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Latency Invariants */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">2.</span>
              <span>Latency Benchmarks &amp; Performance Invariants</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-cyan-500/30 space-y-2">
                <div className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">⚡ AI Voice Synthesis Latency</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 1.50s</div>
                <p className="text-xs text-slate-400">
                  Median voice-to-structured-ticket transformation duration powered by Google Gemini 3.6 Flash streaming (95th percentile &lt; 2.80s).
                </p>
              </div>
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-indigo-500/30 space-y-2">
                <div className="text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider">⚡ Edge Script CDN Latency</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 35ms</div>
                <p className="text-xs text-slate-400">
                  Time-to-first-byte (TTFB) for <code className="text-indigo-300 font-mono">saypulse.min.js</code> loaded across global tier-1 CDN POPs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Incident Severity Matrix */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">3.</span>
              <span>Incident Classification &amp; Response SLA</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-slate-200 font-mono">
                  <tr>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Impact Definition</th>
                    <th className="p-3.5">Enterprise Response</th>
                    <th className="p-3.5">Standard Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  <tr className="bg-red-500/10">
                    <td className="p-3.5 font-bold text-red-400">P1 — Critical Outage</td>
                    <td className="p-3.5 font-sans">CDN script down or complete voice synthesis failure globally</td>
                    <td className="p-3.5 text-white font-bold">&lt; 15 mins (24/7/365)</td>
                    <td className="p-3.5 text-slate-400">&lt; 2 hours</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-bold text-amber-400">P2 — Major Degradation</td>
                    <td className="p-3.5 font-sans">High latency (&gt;5s) or delayed authentication codes</td>
                    <td className="p-3.5 text-white font-bold">&lt; 1 hour</td>
                    <td className="p-3.5 text-slate-400">&lt; 6 hours</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-cyan-400">P3 — Minor Inconvenience</td>
                    <td className="p-3.5 font-sans">Admin dashboard UI glitch or export CSV latency</td>
                    <td className="p-3.5 text-white font-bold">&lt; 6 hours</td>
                    <td className="p-3.5 text-slate-400">&lt; 24 hours</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-bold text-slate-300">P4 — General Request</td>
                    <td className="p-3.5 font-sans">Configuration advice, custom theme integration inquiries</td>
                    <td className="p-3.5 text-white font-bold">&lt; 12 hours</td>
                    <td className="p-3.5 text-slate-400">&lt; 48 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Service Credits */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">4.</span>
              <span>SLA Service Credits</span>
            </h2>
            <p>
              In the event that SayPulse falls below our guaranteed monthly uptime commitment, Enterprise customers are eligible for automated billing credits:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-center">
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10">
                <div className="text-slate-400 mb-1">99.90% – 99.98% Uptime</div>
                <div className="text-xl font-bold text-cyan-400">10% Credit</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10">
                <div className="text-slate-400 mb-1">99.00% – 99.89% Uptime</div>
                <div className="text-xl font-bold text-amber-400">25% Credit</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10">
                <div className="text-slate-400 mb-1">&lt; 99.00% Uptime</div>
                <div className="text-xl font-bold text-emerald-400">50% Credit</div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
