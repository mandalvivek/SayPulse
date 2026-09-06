'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function ComplianceCertificationPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Compliance &amp; Trust</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-4">
            <span>📜 REGULATORY &amp; INFOSEC AUDIT POSTURE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Compliance &amp; Certifications
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            NextGen Multiverse adheres to the highest global data privacy standards, guaranteeing statutory compliance across DPDP Act 2023, GDPR, and HIPAA voice-isolation frameworks.
          </p>
        </div>

        {/* Compliance Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-cyan-500/40 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 text-2xl flex items-center justify-center font-bold">
              🇮🇳
            </div>
            <h3 className="font-bold text-white text-base">DPDP Act 2023 (India)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full alignment with India&apos;s Digital Personal Data Protection Act. Mandatory explicit consent, instant right to erasure, and zero raw voice retention.
            </p>
            <div className="text-[10px] font-mono text-cyan-400 font-bold">✓ CERTIFIED COMPLIANT</div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-indigo-500/40 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 text-2xl flex items-center justify-center font-bold">
              🇪🇺
            </div>
            <h3 className="font-bold text-white text-base">GDPR (EU Regulation)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Privacy by Design &amp; Default. Automatic client-side PII scrubbing prevents sensitive European citizen identifiers from crossing borders.
            </p>
            <div className="text-[10px] font-mono text-indigo-400 font-bold">✓ PRIVACY BY DESIGN</div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-emerald-500/40 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center font-bold">
              🏥
            </div>
            <h3 className="font-bold text-white text-base">HIPAA Voice Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero electronic Protected Health Information (ePHI) storage. Audio is streamed in volatile RAM buffers and destroyed after LLM inference.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 font-bold">✓ ZERO ePHI STORAGE</div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          <section id="data-residency" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">1.</span>
              <span>Sovereign Indian Data Residency</span>
            </h2>
            <p>
              For Indian enterprise and government contracts, SayPulse guarantees that all customer telemetry, synthesized tickets, and audit trails remain hosted strictly within tier-4 datacenter facilities in <strong>Mumbai and New Delhi, India</strong>. Cross-border transmission of raw voice is prohibited by architecture.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">2.</span>
              <span>Statutory Compliance Matrix</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-slate-200 font-mono">
                  <tr>
                    <th className="p-3.5">Standard</th>
                    <th className="p-3.5">Requirement</th>
                    <th className="p-3.5">SayPulse Technical Implementation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-bold text-white font-mono">DPDP Sec 6</td>
                    <td className="p-3.5">Explicit, Unbundled Consent</td>
                    <td className="p-3.5 text-slate-300">User must tap floating mic trigger; browser asks for microphone permission; no background listening.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">DPDP Sec 12</td>
                    <td className="p-3.5">Right to Erasure</td>
                    <td className="p-3.5 text-slate-300">1-click hard deletion in Admin Dashboard purges tickets, transcripts, and metadata immediately.</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-bold text-white font-mono">GDPR Art 25</td>
                    <td className="p-3.5">Data Minimization</td>
                    <td className="p-3.5 text-slate-300">Client regex strips payment cards, emails, Aadhaar, and phone numbers before API dispatch.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">ISO 27001 / SOC 2</td>
                    <td className="p-3.5">Encryption in Transit &amp; at Rest</td>
                    <td className="p-3.5 text-slate-300">TLS 1.3 enforced; SHA-256 salted API tokens; strict CSP policy.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0b1325] border border-cyan-500/30 space-y-3">
            <h3 className="text-lg font-bold text-white">Need a Signed DPA or Compliance Packet?</h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              We provide enterprise legal teams with pre-signed Data Processing Agreements (DPA), Standard Contractual Clauses (SCC), and security attestation summaries upon request.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition"
              >
                <span>Request Enterprise Compliance Packet</span>
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
