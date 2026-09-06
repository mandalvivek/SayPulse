'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function SecurityArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Security Architecture</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-4">
            <span>🛡️ DEFENSE-IN-DEPTH SECURITY STANDARD</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Security Architecture &amp; Hardening
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            A comprehensive overview of NextGen Multiverse&apos;s multi-layered defense model, zero-trust voice isolation, cryptographic token hashing, and bot mitigation pipelines.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-400 font-mono">
            <div><strong className="text-slate-300">Audit Standard:</strong> NextGen Defense-in-Depth Spec v2.4</div>
            <div>•</div>
            <div><strong className="text-slate-300">Transport:</strong> TLS 1.3 Strict HSTS</div>
            <div>•</div>
            <div><strong className="text-slate-300">Widget Isolation:</strong> Shadow DOM v1</div>
          </div>
        </div>

        {/* Security Layers Grid */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">

          {/* Architecture Visual Diagram */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0b1325] border border-white/10 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <span>🏗️</span>
              <span>Defense-in-Depth Pipeline Overview</span>
            </h2>
            <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto space-y-2">
              <div>[ Layer 1: Edge WAF &amp; Reverse Proxy (Cloudflare + TLS 1.3 Strict HSTS) ]</div>
              <div className="text-slate-500 pl-6">│</div>
              <div>[ Layer 2: Tiered Rate Limiting &amp; Bot Defense (Upstash Redis + Turnstile) ]</div>
              <div className="text-slate-500 pl-6">│</div>
              <div>[ Layer 3: Client Shadow DOM &amp; In-Browser PII Regex Redactor ]</div>
              <div className="text-slate-500 pl-6">│</div>
              <div>[ Layer 4: Rigid Schema Validation &amp; Type-Safe Parameterization (Zod) ]</div>
              <div className="text-slate-500 pl-6">│</div>
              <div>[ Layer 5: Ephemeral AI Voice Synthesis &amp; Zero Raw Audio Persistence ]</div>
            </div>
          </section>

          {/* Section 1: Rate Limiting Matrix */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">1.</span>
              <span>Tiered Rate Limiting &amp; DDoS Protection</span>
            </h2>
            <p>
              To eliminate server resource exhaustion and automated scraping, SayPulse enforces granular IP-based quotas across four distinct API tiers:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-slate-200 font-mono">
                  <tr>
                    <th className="p-3.5">Tier Name</th>
                    <th className="p-3.5">Endpoint Scope</th>
                    <th className="p-3.5">Default Quota</th>
                    <th className="p-3.5">Breach Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Tier 1: Read / Browse</td>
                    <td className="p-3.5">Public docs, status, catalogs</td>
                    <td className="p-3.5 text-cyan-400">60 req / IP / min</td>
                    <td className="p-3.5">HTTP 429 + Retry-After</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Tier 2: Search &amp; Filter</td>
                    <td className="p-3.5">Admin search, sentiment queries</td>
                    <td className="p-3.5 text-cyan-400">30 req / IP / min</td>
                    <td className="p-3.5">HTTP 429 + Retry-After</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Tier 3: Feedback Voice Ingest</td>
                    <td className="p-3.5">Audio synthesis, bug submissions</td>
                    <td className="p-3.5 text-cyan-400">5 req / IP / min</td>
                    <td className="p-3.5">HTTP 429 + Challenge</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Tier 4: Reactions &amp; Votes</td>
                    <td className="p-3.5">CSAT sentiment rating clicks</td>
                    <td className="p-3.5 text-cyan-400">1 vote / 24 hrs</td>
                    <td className="p-3.5">HTTP 409 / Graceful Skip</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Shadow DOM & Cross-Origin Defense */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">2.</span>
              <span>Client-Side Shadow DOM Isolation</span>
            </h2>
            <p>
              When embedded on host applications via <code className="text-cyan-300 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">saypulse.min.js</code>, the entire UI renders inside a private Shadow DOM root.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">✓ CSS Leakage Immunity</div>
                <div className="text-slate-400">Host stylesheets and global CSS resets cannot break or distort SayPulse feedback triggers or dialog modals.</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
                <div className="text-cyan-400 font-bold">✓ DOM Scriptor Sandbox</div>
                <div className="text-slate-400">Third-party analytics or untrusted host JavaScript cannot scrape or intercept keystrokes inside the feedback box.</div>
              </div>
            </div>
          </section>

          {/* Section 3: Token Security */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">3.</span>
              <span>Cryptographic Token Security &amp; Zero Raw SQL</span>
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
              <li><strong>Salted SHA-256 Hashing:</strong> Organization API keys (<code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded font-mono text-xs">sp_live_*</code>) are stored exclusively as one-way salted cryptographic digests. Raw keys cannot be extracted from database leaks.</li>
              <li><strong>Zero Raw SQL Injection:</strong> All database queries utilize parameterized object models and strict Zod runtime verification to completely eliminate SQL and NoSQL injection vulnerabilities.</li>
              <li><strong>Strict Content Security Policy (CSP):</strong> Next.js security headers enforce <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded font-mono text-xs">default-src &apos;self&apos;</code> with strict directive whitelisting.</li>
            </ul>
          </section>

          {/* Section 4: Vulnerability Disclosure */}
          <section id="disclosure" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0b1325] border border-cyan-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🎯</span>
              <span>Responsible Vulnerability Disclosure &amp; Bug Bounty</span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              We welcome security researchers and ethical hackers to responsibly report potential vulnerabilities. Please do not execute destructive load tests against production nodes.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition"
              >
                <span>Submit Security Report via Contact Form</span>
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
