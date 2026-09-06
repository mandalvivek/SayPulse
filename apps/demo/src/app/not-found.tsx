'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  const triggerVoiceFeedback = () => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.SayPulse && win.SayPulse.open) {
        win.SayPulse.open('feedback');
      } else if (win.__SAYPULSE_OPEN) {
        win.__SAYPULSE_OPEN('card');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[25%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[25%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Visual Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          <span>📡 SIGNAL 404 — ROUTE UNCHARTED</span>
        </div>

        {/* Big Code */}
        <div className="text-7xl sm:text-9xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cosmic Frequency Lost
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            The requested coordinate does not exist in our telemetry grid, or may have migrated to another realm.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:opacity-95 transition"
          >
            ← Return to Command Center
          </Link>
          <button
            onClick={triggerVoiceFeedback}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>🎙️</span>
            <span>Report Broken Link via Voice</span>
          </button>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs font-mono text-slate-500">
          SayPulse AI • A NextGen Multiverse Company
        </div>
      </div>
    </div>
  );
}
