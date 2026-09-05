'use client';

import React, { useState } from 'react';

export interface FeedbackRecord {
  id: string;
  rating: number;
  quick_tags: string[];
  raw_transcript: string;
  summary: string;
  category: string;
  sentiment: string;
  actionable_item: string;
  tone_variations: { short?: string; formal?: string; elaborated?: string };
  status: string;
  client_context: {
    routeHistory?: string[];
    consoleErrors?: string[];
    viewport?: { width: number; height: number };
    userAgent?: string;
  };
  page_url?: string;
  page_pathname?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  created_at: string;
}

interface ModalProps {
  feedback: FeedbackRecord | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

const SENTIMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Positive: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
  Neutral: { bg: 'rgba(99,102,241,0.12)', text: '#818CF8', border: 'rgba(99,102,241,0.3)' },
  Frustrated: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  Critical: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: 'rgba(239,68,68,0.4)' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Bug: '🐛 Bug Report',
  UX_Friction: '😤 UX Friction',
  Feature_Request: '💡 Feature Request',
  Performance: '⚡ Performance',
  Billing: '💳 Billing',
  General_Praise: '🌟 General Praise',
};

export function FeedbackDetailModal({ feedback, onClose, onStatusChange }: ModalProps) {
  const [selectedTone, setSelectedTone] = useState<'default' | 'short' | 'formal' | 'elaborated'>('default');
  const [copied, setCopied] = useState(false);
  const [waSent, setWaSent] = useState(false);

  if (!feedback) return null;

  const sentimentStyle = SENTIMENT_COLORS[feedback.sentiment] || SENTIMENT_COLORS.Neutral;
  const activeSummary =
    selectedTone === 'default'
      ? feedback.summary
      : feedback.tone_variations?.[selectedTone] || feedback.summary;

  const handleCopy = () => {
    const text = `SayPulse Feedback (${feedback.category} • ${feedback.sentiment})\nRating: ${feedback.rating}/5\nSummary: ${feedback.summary}\nAction Item: ${feedback.actionable_item}\nPage: ${feedback.page_pathname || '/'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚨 *SayPulse Alert (${feedback.category} • ${feedback.sentiment})*\n⭐ Rating: ${feedback.rating}/5\n📍 Page: ${feedback.page_pathname}\n\n📝 *AI Summary:* ${feedback.summary}\n\n💡 *Action Item:* ${feedback.actionable_item}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setWaSent(true);
    setTimeout(() => setWaSent(false), 3000);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Header ── */}
        <div style={styles.header}>
          <div>
            <div style={styles.badgeRow}>
              <span style={{ ...styles.sentimentBadge, ...sentimentStyle }}>
                {feedback.sentiment}
              </span>
              <span style={styles.categoryBadge}>
                {CATEGORY_ICONS[feedback.category] || feedback.category}
              </span>
              <span style={styles.starsBadge}>
                {'★'.repeat(feedback.rating || 0)}{'☆'.repeat(5 - (feedback.rating || 0))} ({feedback.rating}/5)
              </span>
              <span style={styles.dateLabel}>{formatDate(feedback.created_at)}</span>
            </div>
            <p style={styles.title}>{feedback.page_pathname || '/'}</p>
          </div>

          <button onClick={onClose} style={styles.closeBtn} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div style={styles.scrollContent}>
          {/* ── 1. Spoken Transcript ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionLabel}>🎙️ Exact Spoken Audio Transcript</span>
              <span style={styles.rawTag}>Raw Speech</span>
            </div>
            <p style={styles.rawTranscriptText}>
              &ldquo;{feedback.raw_transcript}&rdquo;
            </p>
            {feedback.quick_tags && feedback.quick_tags.length > 0 && (
              <div style={styles.tagsRow}>
                {feedback.quick_tags.map((t) => (
                  <span key={t} style={styles.tagChip}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. Gemini AI Structured Summary ── */}
          <div style={{ ...styles.sectionCard, borderColor: 'rgba(6,182,212,0.3)', background: '#0F172A' }}>
            <div style={styles.sectionHeader}>
              <span style={{ ...styles.sectionLabel, color: '#38BDF8' }}>✨ Gemini AI Structured Summary</span>
              <div style={styles.tonePills}>
                <span style={styles.toneLabel}>Tone:</span>
                {(['default', 'short', 'formal', 'elaborated'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    style={{
                      ...styles.toneBtn,
                      background: selectedTone === tone ? '#06B6D4' : '#1E293B',
                      color: selectedTone === tone ? '#fff' : '#94A3B8',
                    }}
                  >
                    {tone === 'default' ? 'Original' : tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <p style={styles.summaryText}>{activeSummary}</p>
          </div>

          {/* ── 3. Actionable Recommendation ── */}
          {feedback.actionable_item && (
            <div style={styles.actionCard}>
              <div style={styles.actionHeader}>
                <span style={styles.actionLabel}>💡 Recommended Product Action</span>
                <span style={styles.actionImpact}>Engineering Task</span>
              </div>
              <p style={styles.actionText}>{feedback.actionable_item}</p>
            </div>
          )}

          {/* ── 4. User Route Journey Breadcrumbs ── */}
          {feedback.client_context?.routeHistory && feedback.client_context.routeHistory.length > 0 && (
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionLabel}>🗺️ User Journey Prior to Feedback</span>
              </div>
              <div style={styles.journeyPath}>
                {feedback.client_context.routeHistory.map((route, i) => (
                  <React.Fragment key={i}>
                    <span style={styles.journeyNode}>
                      {route === feedback.page_pathname ? `📍 ${route}` : route}
                    </span>
                    {i < feedback.client_context.routeHistory!.length - 1 && (
                      <span style={styles.journeyArrow}>➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. Technical Context & Console Errors ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionLabel}>💻 Client Technical Metadata</span>
            </div>
            <div style={styles.techGrid}>
              <div style={styles.techItem}>
                <span style={styles.techKey}>Browser:</span>
                <span style={styles.techVal}>{feedback.browser || 'Unknown'}</span>
              </div>
              <div style={styles.techItem}>
                <span style={styles.techKey}>Operating System:</span>
                <span style={styles.techVal}>{feedback.os || 'Unknown'}</span>
              </div>
              <div style={styles.techItem}>
                <span style={styles.techKey}>Device:</span>
                <span style={styles.techVal}>{feedback.device_type || 'Desktop'}</span>
              </div>
              <div style={styles.techItem}>
                <span style={styles.techKey}>Viewport:</span>
                <span style={styles.techVal}>
                  {feedback.client_context?.viewport
                    ? `${feedback.client_context.viewport.width} × ${feedback.client_context.viewport.height}px`
                    : '1440 × 900px'}
                </span>
              </div>
            </div>

            {feedback.client_context?.consoleErrors && feedback.client_context.consoleErrors.length > 0 && (
              <div style={styles.errorBox}>
                <p style={styles.errorTitle}>⚠️ Captured Console Errors:</p>
                {feedback.client_context.consoleErrors.map((err, i) => (
                  <code key={i} style={styles.errorCode}>
                    {err}
                  </code>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div style={styles.footer}>
          <div style={styles.statusGroup}>
            <span style={styles.statusLabel}>Status:</span>
            {(['new', 'in_review', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange?.(feedback.id, st)}
                style={{
                  ...styles.statusBtn,
                  background: feedback.status === st ? '#10B981' : '#1E293B',
                  color: feedback.status === st ? '#fff' : '#94A3B8',
                  borderColor: feedback.status === st ? '#10B981' : '#334155',
                }}
              >
                {st === 'new' ? 'New' : st === 'in_review' ? 'In Review' : '✓ Resolved'}
              </button>
            ))}
          </div>

          <div style={styles.actionButtonGroup}>
            <button onClick={handleCopy} style={styles.copyBtn}>
              {copied ? '✓ Copied!' : '📋 Copy Summary'}
            </button>
            <button onClick={handleWhatsAppShare} style={styles.waBtn}>
              {waSent ? '✓ Sent!' : '📲 Send to WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  modal: {
    background: '#0F172A',
    borderRadius: 20,
    border: '1px solid #1E293B',
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 30px 90px rgba(0,0,0,0.8)',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  sentimentBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 14,
    border: '1px solid',
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#94A3B8',
    background: '#1E293B',
    border: '1px solid #334155',
    padding: '3px 9px',
    borderRadius: 14,
  },
  starsBadge: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: 600,
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
  },

  scrollContent: {
    padding: '20px 24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionCard: {
    background: '#1E293B',
    borderRadius: 14,
    border: '1px solid #334155',
    padding: '16px 18px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rawTag: {
    background: '#0F172A',
    border: '1px solid #334155',
    color: '#64748B',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 10,
  },
  rawTranscriptText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 1.6,
    fontStyle: 'italic',
    margin: 0,
  },
  tagsRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagChip: {
    fontSize: 11,
    color: '#06B6D4',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.25)',
    padding: '2px 8px',
    borderRadius: 12,
  },

  summaryText: {
    color: '#F1F5F9',
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
  },
  tonePills: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  toneLabel: {
    color: '#64748B',
    fontSize: 11,
    marginRight: 2,
  },
  toneBtn: {
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  actionCard: {
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderLeft: '4px solid #6366F1',
    borderRadius: 14,
    padding: '16px 18px',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  actionImpact: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: 700,
    background: 'rgba(99,102,241,0.15)',
    padding: '2px 8px',
    borderRadius: 10,
  },
  actionText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
  },

  journeyPath: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  journeyNode: {
    background: '#0F172A',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 8,
  },
  journeyArrow: {
    color: '#06B6D4',
    fontSize: 12,
  },

  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  techItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
  },
  techKey: {
    color: '#64748B',
  },
  techVal: {
    color: '#F1F5F9',
    fontWeight: 600,
  },
  errorBox: {
    marginTop: 12,
    padding: '10px 12px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  errorCode: {
    color: '#FCA5A5',
    fontSize: 11,
    fontFamily: 'monospace',
    display: 'block',
  },

  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #1E293B',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 600,
  },
  statusBtn: {
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 14,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  copyBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  waBtn: {
    background: '#059669',
    border: 'none',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
