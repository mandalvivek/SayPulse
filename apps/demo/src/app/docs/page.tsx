'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/app/components/PublicNav';

export default function DeveloperDocumentationPage() {
  const [activeTab, setActiveTab] = useState<'html' | 'react' | 'rest' | 'webhooks'>('html');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const htmlCode = `<!-- Place before </head> or </body> -->
<script
  src="https://saypulse.nextgenmultiverse.com/saypulse.min.js"
  data-key="sp_live_your_organization_api_key"
  data-position="bottom-right"
  data-color="#06B6D4"
  data-animation="siri-wave"
  data-trigger-style="minimal-pill"
  data-auto-collapse="true"
  defer
></script>`;

  const reactCode = `// 1. Install packages
// npm install @saypulse/react @saypulse/core

import React from 'react';
import { SayPulseProvider, SayPulseWidget } from '@saypulse/react';

export default function App({ children }) {
  return (
    <SayPulseProvider
      apiKey="sp_live_your_organization_api_key"
      options={{
        theme: 'dark',
        accentColor: '#06B6D4',
        position: 'bottom-right',
        triggerStyle: 'minimal-pill',
        autoCollapseOnScroll: true
      }}
    >
      {children}
      <SayPulseWidget />
    </SayPulseProvider>
  );
}`;

  const restCode = `// POST https://saypulse.nextgenmultiverse.com/saypulse/v1/feedback/submit-voice
// Headers: 
//   Authorization: Bearer sp_live_your_organization_api_key
//   Content-Type: multipart/form-data

const formData = new FormData();
formData.append('audio', audioBlob, 'feedback.webm');
formData.append('pageUrl', window.location.href);
formData.append('rating', '5');

const res = await fetch('https://saypulse.nextgenmultiverse.com/saypulse/v1/feedback/submit-voice', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sp_live_your_organization_api_key'
  },
  body: formData
});

const data = await res.json();
console.log('Synthesized Ticket:', data);`;

  const webhookCode = `// Inbound Webhook Payload dispatched on new user voice note
{
  "event": "feedback.created",
  "id": "fb_98234812",
  "timestamp": "2026-09-06T18:00:00Z",
  "organizationId": "org_nextgen_demo",
  "category": "bug",
  "sentiment": "negative",
  "summary": "Student reported submit button unresponsive during assessment drill.",
  "tasks": [
    "Inspect submit button event handler on mobile browsers",
    "Verify network timeout backoff policy"
  ],
  "pageUrl": "https://examdesk.nextgenmultiverse.com/drill/physics-101",
  "userScore": 2
}`;

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">Documentation</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-4">
            <span>⚡ DEVELOPER SDK &amp; INTEGRATION GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Developer Documentation
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            Integrate SayPulse into any web application in under 2 minutes. Choose from our lightweight vanilla JavaScript embed, full React/Next.js SDK, or RESTful API.
          </p>
        </div>

        {/* Integration Code Tabs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1325] border border-white/10 shadow-2xl mb-12">
          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'html'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              1. 1-Line HTML Script
            </button>
            <button
              onClick={() => setActiveTab('react')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'react'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              2. React / Next.js SDK
            </button>
            <button
              onClick={() => setActiveTab('rest')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'rest'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              3. REST Synthesis API
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'webhooks'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              4. Webhooks &amp; Events
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            {activeTab === 'html' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">Zero build step required. Works in WordPress, Shopify, Next.js, HTML5.</div>
                  <button
                    onClick={() => copyCode(htmlCode, 'html')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    {copied === 'html' ? '✓ Copied!' : 'Copy Snippet'}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed">
                  {htmlCode}
                </pre>
              </div>
            )}

            {activeTab === 'react' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">Type-safe React 18/19 components with full hooks support.</div>
                  <button
                    onClick={() => copyCode(reactCode, 'react')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    {copied === 'react' ? '✓ Copied!' : 'Copy Snippet'}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed">
                  {reactCode}
                </pre>
              </div>
            )}

            {activeTab === 'rest' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">Direct HTTP endpoint for custom mobile apps (iOS / Android / Flutter).</div>
                  <button
                    onClick={() => copyCode(restCode, 'rest')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    {copied === 'rest' ? '✓ Copied!' : 'Copy Snippet'}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed">
                  {restCode}
                </pre>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">Stream feedback tickets straight into Jira, Slack, Linear, or Discord.</div>
                  <button
                    onClick={() => copyCode(webhookCode, 'webhooks')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    {copied === 'webhooks' ? '✓ Copied!' : 'Copy Snippet'}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed">
                  {webhookCode}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Styles Reference */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <span className="text-cyan-400">🎨</span>
            <span>Supported Trigger Styles (data-trigger-style)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">1. classic-circle</div>
              <div className="text-slate-400">Compact circular floating action button with live glowing halo.</div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">2. bubble-wave</div>
              <div className="text-slate-400">Multi-layer concentric radar wave effect with soundwave preview.</div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">3. tab-corner</div>
              <div className="text-slate-400">Docked edge bookmark tab for non-intrusive enterprise page borders.</div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">4. minimal-pill</div>
              <div className="text-slate-400">Voice Feedback badge with auto-collapse slide on scroll.</div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">5. sleek-badge</div>
              <div className="text-slate-400">Micro pill with subtle dot indicator and glassmorphic blur.</div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-[#0b1325] border border-white/10 space-y-1.5">
              <div className="text-cyan-400 font-bold">6. dynamic-island</div>
              <div className="text-slate-400">Expandable floating bottom bar with waveform activity metrics.</div>
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300">Want to test each style interactively with live configuration preview?</span>
            <Link
              href="/admin/demo/widget-studio"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Open Interactive Widget Studio ➔
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
