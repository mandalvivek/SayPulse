'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-4">
            <span>🛡️ ZERO-STORAGE AUDIO INVARIANT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Privacy Policy &amp; Data Governance
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            How SayPulse and NextGen Multiverse protect user voice privacy, enforce client-side PII redaction, eliminate raw audio persistence, and comply with the Digital Personal Data Protection Act, 2023.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-400 font-mono">
            <div><strong className="text-slate-300">Effective Date:</strong> September 1, 2026</div>
            <div>•</div>
            <div><strong className="text-slate-300">Entity:</strong> NextGen Multiverse Enterprises Pvt Ltd</div>
            <div>•</div>
            <div><strong className="text-slate-300">Jurisdiction:</strong> Republic of India</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          {/* Section 1: Core Privacy Architecture */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">1.</span>
              <span>The Zero-Storage Audio Invariant</span>
            </h2>
            <p>
              SayPulse operates on a strict zero-trust voice processing pipeline. When an end-user records voice feedback on any SayPulse-enabled web property, the raw audio is converted to an ephemeral in-memory buffer, streamed to Gemini 3.6 Flash for synthesis, and <strong>permanently purged immediately upon completion</strong>.
            </p>
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1325] border border-cyan-500/30 space-y-3 font-mono text-xs sm:text-sm text-cyan-300">
              <div className="font-bold text-white flex items-center space-x-2">
                <span>🔄</span>
                <span>Ephemeral Audio Processing Pipeline:</span>
              </div>
              <p className="text-slate-300">
                1. User Taps Microphone ➔ 2. Audio Streamed into Memory Buffer ➔ 3. Client-Side PII Redacted ➔ 4. TLS 1.3 Transport to AI Synthesis ➔ 5. Structured Insights Stored ➔ 6. <strong>Raw Audio Purged from Memory.</strong>
              </p>
              <div className="text-[11px] text-slate-400">
                ⚠️ Neither SayPulse nor its parent entity NextGen Multiverse stores WAV, MP3, WebM, or raw speech recordings on disk or cloud buckets.
              </div>
            </div>
          </section>

          {/* Section 2: DPDP Act 2023 Compliance */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">2.</span>
              <span>DPDP Act 2023 (India) Compliance</span>
            </h2>
            <p>
              In accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of the Republic of India:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
              <li><strong>Lawful Basis &amp; Explicit Consent:</strong> Audio capture only activates upon explicit user action (tapping the microphone widget). No background ambient recording ever occurs.</li>
              <li><strong>Purpose Limitation:</strong> Synthesized transcripts and telemetry are utilized solely for user experience diagnosis, bug tracking, and product feedback.</li>
              <li><strong>No Biometric Profiling:</strong> We do not extract voiceprints, acoustic biometric identifiers, or speaker identification traits.</li>
              <li><strong>Right to Erasure &amp; Correction:</strong> Workspace administrators and users may request permanent purging of any synthesized feedback ticket at any time via the Admin Dashboard or by submitting a privacy erasure request.</li>
            </ul>
          </section>

          {/* Section 3: Client-Side PII Redaction */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">3.</span>
              <span>Automated Client-Side PII Scrubbing</span>
            </h2>
            <p>
              Before text transcripts or speech metadata leave the user&apos;s browser, the <code className="text-cyan-300 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">@saypulse/core</code> privacy engine scans and redacts sensitive strings:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-slate-200 font-mono">
                  <tr>
                    <th className="p-3.5">Sensitive Data Pattern</th>
                    <th className="p-3.5">Target Scope</th>
                    <th className="p-3.5">Sanitized Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Payment Cards</td>
                    <td className="p-3.5">13–19 digit Visa, Mastercard, RuPay, Amex</td>
                    <td className="p-3.5 font-mono text-cyan-400">[REDACTED_CARD]</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Phone Numbers</td>
                    <td className="p-3.5">10-digit mobile &amp; international prefixes</td>
                    <td className="p-3.5 font-mono text-cyan-400">[REDACTED_PHONE]</td>
                  </tr>
                  <tr className="bg-[#0b1325]/50">
                    <td className="p-3.5 font-semibold text-white">Email Addresses</td>
                    <td className="p-3.5">RFC 5322 Standard Email Regex</td>
                    <td className="p-3.5 font-mono text-cyan-400">[REDACTED_EMAIL]</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-white">Govt Identity Numbers</td>
                    <td className="p-3.5">12-digit Aadhaar &amp; National Tax ID formats</td>
                    <td className="p-3.5 font-mono text-cyan-400">[REDACTED_GOV_ID]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Data Ownership & Isolation */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">4.</span>
              <span>100% Tenant Data Ownership</span>
            </h2>
            <p>
              Your customer feedback data belongs entirely to your organization. NextGen Multiverse does not sell, lease, or monetize your feedback records. Your data is never used to train public foundation AI models or shared with third-party advertisers.
            </p>
          </section>

          {/* Section 5: Cookies & Local Storage */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span className="text-cyan-400">5.</span>
              <span>Cookies &amp; Local Storage</span>
            </h2>
            <p>
              SayPulse uses essential local storage keys to preserve widget state, active session tokens, and preferred animation settings across page transitions. No invasive third-party cross-site advertising trackers are injected into the client bundle.
            </p>
          </section>

          {/* Section 6: Data Protection Officer */}
          <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#0b1325] border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Data Protection Officer &amp; Grievance Redressal</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              In accordance with DPDP Act requirements, for privacy inquiries, data deletion requests, or compliance verification, you can submit an inquiry directly through our contact portal.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition"
              >
                <span>Submit Privacy Inquiry or Erasure Request</span>
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
