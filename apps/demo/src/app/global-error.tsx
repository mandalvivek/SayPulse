'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#040711] text-slate-100 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-[#0b1325] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl">⚡</div>
          <h1 className="text-2xl font-bold text-white">System Signal Offline</h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            The core application root container encountered an unexpected error. Please restart the interface.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
            >
              ↻ Reload Application
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
