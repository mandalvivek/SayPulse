'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Terms of Service</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold mb-4">
            <span>📄 ENTERPRISE MASTER SERVICES AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            These Terms of Service govern your access to the SayPulse Voice Intelligence Platform, Widget SDKs, Admin Dashboards, and API Services operated by NextGen Multiverse Enterprises.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-400 font-mono">
            <div><strong className="text-slate-300">Effective Date:</strong> September 1, 2026</div>
            <div>•</div>
            <div><strong className="text-slate-300">Operating Entity:</strong> NextGen Multiverse Enterprises Pvt Ltd</div>
            <div>•</div>
            <div><strong className="text-slate-300">Governing Law:</strong> Republic of India</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          {/* Section 1: Acceptance & Accounts */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">1.</span>
              <span>Acceptance &amp; Account Provisioning</span>
            </h2>
            <p>
              By embedding <code className="text-cyan-300 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">saypulse.min.js</code> on your website, installing the React SDK, or accessing the SayPulse Admin Dashboard, you agree to be bound by these terms. Accounts may be provisioned via verified business credentials or organization master access. You are responsible for safeguarding your API keys and administrative access credentials.
            </p>
          </section>

          {/* Section 2: Usage Rights & Fair Use Tiers */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">2.</span>
              <span>Tier Quotas &amp; Fair Use Policy</span>
            </h2>
            <p>
              SayPulse provides tiered quotas based on your subscription tier:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-2">
                <div className="text-cyan-400 font-bold text-sm">Starter Tier</div>
                <div className="text-slate-400">500 Voice Notes / month</div>
                <div className="text-slate-500 text-[11px]">Community Support • Basic PII Scrubbing</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-cyan-500/40 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500 text-black text-[9px] font-bold uppercase">Popular</div>
                <div className="text-white font-bold text-sm">Growth Tier</div>
                <div className="text-cyan-300">3,000 Voice Notes / month</div>
                <div className="text-slate-400 text-[11px]">Priority Gemini Flash • Webhook Dispatch</div>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-indigo-500/40 space-y-2">
                <div className="text-indigo-400 font-bold text-sm">Enterprise Tier</div>
                <div className="text-slate-300">Custom / Unlimited Volume</div>
                <div className="text-slate-400 text-[11px]">Dedicated VPC • 99.99% SLA • Custom Domain</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Accounts consistently exceeding quotas without upgrading may experience synthesis rate-limiting in accordance with standard HTTP 429 back-off protocols.
            </p>
          </section>

          {/* Section 3: Data Ownership & IP */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">3.</span>
              <span>Data Ownership &amp; Intellectual Property</span>
            </h2>
            <div className="p-5 sm:p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-white flex items-center space-x-2">
                <span>🔑</span>
                <span>100% Tenant Ownership Guarantee:</span>
              </div>
              <p className="text-slate-200">
                You retain all rights, title, and interest in and to all customer feedback data, sentiment analyses, audio transcripts, and category tags captured through your SayPulse deployment. NextGen Multiverse will never sell, lease, or use your organization&apos;s proprietary customer feedback to train public models.
              </p>
            </div>
            <p>
              NextGen Multiverse retains all proprietary rights, copyright, and trade secrets in the SayPulse codebase, Widget Studio components, visualizer rendering shaders, and SDK architecture.
            </p>
          </section>

          {/* Section 4: Prohibited Uses */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">4.</span>
              <span>Prohibited Activities</span>
            </h2>
            <p>Tenants and end-users agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
              <li>Use SayPulse for non-consensual voice surveillance, wiretapping, or covert eavesdropping.</li>
              <li>Reverse engineer, decompile, or tamper with the client-side Shadow DOM security perimeter.</li>
              <li>Attempt to bypass rate limits or conduct denial-of-service attacks against API endpoints.</li>
              <li>Transmit malware, spyware, or malicious payloads through feedback form fields.</li>
            </ul>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">5.</span>
              <span>Limitation of Liability &amp; SLA Credits</span>
            </h2>
            <p>
              In no event shall NextGen Multiverse be liable for indirect, incidental, or consequential damages. For Enterprise tier customers, our exclusive remedy for service interruptions is outlined in our <Link href="/sla" className="text-cyan-400 hover:underline font-semibold">Enterprise Service Level Agreement (SLA)</Link>.
            </p>
          </section>

          {/* Section 6: Jurisdiction */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">6.</span>
              <span>Governing Law &amp; Dispute Resolution</span>
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any dispute arising under this Agreement shall be submitted to the exclusive jurisdiction of the competent courts located in <strong>New Delhi, India</strong>.
            </p>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
