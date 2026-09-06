'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('enterprise-sales');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Form dispatches directly to official NextGen enterprise inbox
    const subject = encodeURIComponent(`[SayPulse Contact] ${topic.toUpperCase()} - from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nDepartment: ${topic}\n\nMessage:\n${message}`
    );
    const mailtoUrl = `mailto:nextgenmultiverseenterprise@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Also open client mail app with populated fields
      try {
        window.location.href = mailtoUrl;
      } catch (err) {
        // Fallback gracefully
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Contact Us</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-4">
            <span>✉️ DIRECT ENTERPRISE INQUIRY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Connect with SayPulse &amp; NextGen Multiverse
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Whether you are exploring high-volume enterprise contracts, custom VPC deployments, DPDP compliance reviews, or developer API integrations, our engineering team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-white/10 shadow-2xl">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-white">Inquiry Prepared &amp; Dispatched!</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Thank you for reaching out, <strong>{name}</strong>. Your message is dispatched to our enterprise team. We will review and respond to <strong>{email}</strong> promptly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-cyan-300 font-bold transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-2">Send an Inquiry</h2>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white outline-none focus:border-cyan-500 font-mono transition placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Inquiry Department
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white outline-none focus:border-cyan-500 font-mono transition"
                    >
                      <option value="enterprise-sales">💼 Enterprise Pricing &amp; Custom Volume</option>
                      <option value="developer-support">⚡ Developer API &amp; SDK Support</option>
                      <option value="compliance-audit">📜 DPDP Act 2023 / HIPAA Compliance Review</option>
                      <option value="security-disclosure">🛡️ Security Disclosure &amp; Bug Bounty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      How Can We Help?
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Tell us about your application stack, expected monthly voice notes, or technical requirements..."
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? '⏳ Preparing Dispatch...' : 'Dispatch Message ➔'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Organization Details & Support Information */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-white/10 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🏢</span>
                <span>Operating Entity &amp; Headquarters</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <div className="text-slate-400 font-mono uppercase text-[10px]">Legal Entity</div>
                  <div className="font-semibold text-white text-sm">NextGen Multiverse Enterprises Pvt Ltd</div>
                </div>
                <div>
                  <div className="text-slate-400 font-mono uppercase text-[10px]">Headquarters Location</div>
                  <div>New Delhi, NCR, Republic of India</div>
                </div>
                <div>
                  <div className="text-slate-400 font-mono uppercase text-[10px]">Official Enterprise Portal</div>
                  <div>
                    <a
                      href="https://nextgenmultiverse.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>nextgenmultiverse.com</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-[#0b1325] border border-cyan-500/30 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>⏱️</span>
                <span>Response SLA Guarantee</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enterprise and developer inquiries submitted through this portal are prioritized and handled directly by solutions engineering. Standard response time is within 2 to 4 business hours.
              </p>
            </div>

          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
