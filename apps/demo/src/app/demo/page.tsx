'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const KPI_CARDS = [
  { label: 'Total Assessments', value: '48,290', change: '+14.2%', up: true, color: '#06B6D4' },
  { label: 'Active Candidates', value: '12,847', change: '+8.1%', up: true, color: '#6366F1' },
  { label: 'AI Proctor CSAT', value: '4.85 / 5', change: '+0.4', up: true, color: '#10B981' },
  { label: 'Avg Exam Completion', value: '42m 18s', change: '-4m', up: true, color: '#F59E0B' },
];

const RECENT_CANDIDATES = [
  { name: 'Priya Sharma', exam: 'Full Stack Engineering Assessment', score: '94%', time: '2 min ago', status: 'Completed' },
  { name: 'Arjun Mehta', exam: 'Data Structures & Algorithms', score: '88%', time: '14 min ago', status: 'Completed' },
  { name: 'Kavitha Nair', exam: 'Cloud Infrastructure & DevOps', score: 'In Progress', time: 'Started 20m ago', status: 'Proctoring' },
  { name: 'Rohan Desai', exam: 'AI & Machine Learning Foundations', score: '92%', time: '1 hr ago', status: 'Completed' },
  { name: 'Sneha Kulkarni', exam: 'System Architecture Design', score: 'Under Review', time: '2 hr ago', status: 'Evaluating' },
];

const STATUS_COLOR: Record<string, string> = {
  Completed: '#10B981',
  Proctoring: '#06B6D4',
  Evaluating: '#F59E0B',
};

export default function ClientDemoPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 p-4 sm:p-8 font-sans">
      {/* Top Banner & Navigation Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 border border-cyan-500/20 shadow-xl backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            🎓
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-lg sm:text-xl">NextGen ExamDesk</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LIVE CLIENT DEMO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simulated Host Application with SayPulse AI Voice Widget Embedded
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition"
          >
            ← SayPulse Home
          </Link>
          <Link
            href="/admin/demo"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 transition"
          >
            📊 Open Demo Admin Feed →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Helper Banner */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-indigo-300">
            <span className="text-base">🎙️</span>
            <span>
              <strong>Try the widget:</strong> Tap the floating microphone in the bottom-right corner to speak feedback (e.g. <em>"The proctoring camera calibration was super fast and smooth!"</em>).
            </span>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).SayPulse?.open) {
                (window as any).SayPulse.open();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-500/40 transition whitespace-nowrap"
          >
            Open Widget Now
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KPI_CARDS.map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">{card.label}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: card.color, boxShadow: `0 0 10px ${card.color}` }}
                />
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
              <div className="mt-2 text-xs text-emerald-400 font-mono font-bold">{card.change} vs last month</div>
            </div>
          ))}
        </div>

        {/* Assessments & Recent Activity Table */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white text-base">Recent Examination Runs</h3>
              <p className="text-xs text-slate-400">Live candidate telemetry across enterprise proctoring pools</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                Live Proctor Stream
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Exam Module</th>
                  <th className="pb-3">Score / Status</th>
                  <th className="pb-3">Activity</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RECENT_CANDIDATES.map((c, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 font-medium text-white">{c.name}</td>
                    <td className="py-3.5 text-slate-300">{c.exam}</td>
                    <td className="py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${STATUS_COLOR[c.status]}20`,
                          color: STATUS_COLOR[c.status],
                          border: `1px solid ${STATUS_COLOR[c.status]}40`,
                        }}
                      >
                        {c.score} • {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono">{c.time}</td>
                    <td className="py-3.5 text-right">
                      <button className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
