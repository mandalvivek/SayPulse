'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function PublicHeader({
  onOpenAuth,
}: {
  onOpenAuth?: (flow: 'signin' | 'register') => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAuth = (flow: 'signin' | 'register') => {
    if (onOpenAuth) {
      onOpenAuth(flow);
    } else {
      window.location.href = `/?auth=${flow}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#040711]/85 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-600/35 border border-cyan-500/50 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <span className="text-xl">🎙️</span>
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-sm sm:text-base text-white group-hover:text-cyan-400 transition">
                SAYPULSE
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                A NextGen Multiverse Company
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => handleAuth('signin')}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuth('register')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] transition cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open directory drawer"
              className="p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Categorized Slide-out Hamburger Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-[#0b1325] border-l border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col justify-between h-full z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">🎙️</span>
                  <div>
                    <div className="font-extrabold text-white text-base">SayPulse Hub</div>
                    <div className="text-[10px] text-cyan-400 font-mono">Enterprise Navigation Directory</div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/demo"
                  onClick={() => setDrawerOpen(false)}
                  className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition flex flex-col justify-between"
                >
                  <span className="text-lg mb-1">🎓</span>
                  <span>ExamDesk Demo</span>
                </Link>
                <Link
                  href="/admin/demo"
                  onClick={() => setDrawerOpen(false)}
                  className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition flex flex-col justify-between"
                >
                  <span className="text-lg mb-1">📊</span>
                  <span>Admin Sandbox</span>
                </Link>
              </div>

              {/* Drawer Links Sections */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Product & Platform
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/admin/demo/widget-studio"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      🎨 Interactive Widget Studio
                    </Link>
                    <Link
                      href="/docs"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      ⚡ Developer & SDK Documentation
                    </Link>
                    <Link
                      href="/status"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      🟢 Live System Status & SLA
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Trust, Security & Compliance
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/security"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      🛡️ Security Architecture & Hardening
                    </Link>
                    <Link
                      href="/compliance"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      📜 DPDP Act 2023 & GDPR Compliance
                    </Link>
                    <Link
                      href="/sla"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      ⏱️ Enterprise 99.99% SLA Guarantee
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Company & Governance
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/about"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      🏢 About Us & NextGen Story
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      ✉️ Contact & Enterprise Sales
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      🔒 Privacy Policy (Zero-Storage Audio)
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setDrawerOpen(false)}
                      className="block p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      📄 Terms of Service & Data Ownership
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
              <span>A NextGen Multiverse Company</span>
              <span className="font-mono text-cyan-400 text-[10px]">v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#030611] py-8 text-xs text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-600/35 border border-cyan-500/50 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            🎙️
          </div>
          <div>
            <span className="font-extrabold text-white">SayPulse AI</span>
            <span className="text-slate-600 mx-2">•</span>
            <span className="text-slate-400">A NextGen Multiverse Company</span>
          </div>
        </div>

        {/* Center: Only Essential Required Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link href="/about" className="hover:text-cyan-400 transition font-medium">
            About Us
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/privacy" className="hover:text-cyan-400 transition font-medium">
            Privacy Policy
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms" className="hover:text-cyan-400 transition font-medium">
            Terms & Conditions
          </Link>
        </div>

        {/* Right: Copyright & Jurisdiction */}
        <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono">
          <span>Republic of India</span>
          <span className="text-slate-700">•</span>
          <span>© 2026 NextGen Multiverse</span>
        </div>
      </div>
    </footer>
  );
}
