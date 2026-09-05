'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FeedbackDetailModal, FeedbackRecord } from '../../components/FeedbackDetailModal';

export default function TenantFeedbackInboxPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'demo';

  const [items, setItems] = useState<FeedbackRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [sentiment, setSentiment] = useState('all');
  const [category, setCategory] = useState('all');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('slug', slug);
      if (sentiment !== 'all') query.set('sentiment', sentiment);
      if (category !== 'all') query.set('category', category);
      if (status !== 'all') query.set('status', status);
      if (rating) query.set('rating', String(rating));
      if (search) query.set('search', search);

      const res = await fetch(`/saypulse/v1/admin/feedback?${query.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed fetching feedback list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [slug, sentiment, category, rating, status, search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/saypulse/v1/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, slug }),
      });
      fetchFeedback();
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error('Failed updating status:', e);
    }
  };

  const getSentimentPill = (sent?: string) => {
    switch (sent) {
      case 'Positive':
        return { bg: 'rgba(16,185,129,0.15)', text: '#34D399', border: 'rgba(16,185,129,0.3)' };
      case 'Critical':
        return { bg: 'rgba(239,68,68,0.15)', text: '#F87171', border: 'rgba(239,68,68,0.3)' };
      case 'Frustrated':
        return { bg: 'rgba(245,158,11,0.15)', text: '#FBBF24', border: 'rgba(245,158,11,0.3)' };
      default:
        return { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8', border: 'rgba(148,163,184,0.3)' };
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'Bug':
        return { icon: '🐛', label: 'Bug / Defect', color: '#EF4444' };
      case 'UX_Friction':
        return { icon: '⚡', label: 'UX Friction', color: '#F59E0B' };
      case 'Feature_Request':
        return { icon: '💡', label: 'Feature Request', color: '#8B5CF6' };
      case 'Performance':
        return { icon: '⏱️', label: 'Performance', color: '#EC4899' };
      default:
        return { icon: '💬', label: 'General Feedback', color: '#06B6D4' };
    }
  };

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.workspacePill}>
            <span>🏢 /admin/{slug}</span>
          </div>
          <h1 style={styles.title}>Live Voice Feedback Inbox</h1>
          <p style={styles.subtitle}>
            Showing {total} customer voice submissions processed by Gemini Flash AI.
          </p>
        </div>

        <button onClick={fetchFeedback} style={styles.refreshBtn}>
          ↻ Refresh Inbox
        </button>
      </div>

      {/* ── Real-Time Filter Toolbar ── */}
      <div style={styles.filterToolbar}>
        {/* Search Input */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="🔍 Search spoken keywords, summaries, routes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.clearSearchBtn}>
              ✕
            </button>
          )}
        </div>

        {/* Sentiment Pills */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Sentiment:</span>
          {['all', 'Positive', 'Neutral', 'Frustrated', 'Critical'].map((s) => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              style={{
                ...styles.filterPill,
                background: sentiment === s ? '#06B6D4' : '#1E293B',
                color: sentiment === s ? '#fff' : '#94A3B8',
                borderColor: sentiment === s ? '#06B6D4' : '#334155',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Categories</option>
            <option value="Bug">🐛 Bug</option>
            <option value="UX_Friction">⚡ UX Friction</option>
            <option value="Feature_Request">💡 Feature Request</option>
            <option value="Performance">⏱️ Performance</option>
            <option value="General_Praise">💬 Praise</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Statuses</option>
            <option value="new">🆕 New</option>
            <option value="in_review">👀 In Review</option>
            <option value="resolved">✅ Resolved</option>
            <option value="ignored">🚫 Ignored</option>
          </select>
        </div>
      </div>

      {/* ── Feed List ── */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p style={{ color: '#64748B' }}>Loading feedback items…</p>
        </div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div>
          <h3 style={styles.emptyTitle}>No feedback records found for /admin/{slug}</h3>
          <p style={styles.emptySub}>
            {search || sentiment !== 'all' || category !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Once visitors use the floating voice widget on your site, their submissions will appear here instantly!'}
          </p>
        </div>
      ) : (
        <div style={styles.feedbackList}>
          {items.map((fb) => {
            const sentStyle = getSentimentPill(fb.sentiment);
            const catBadge = getCategoryBadge(fb.category);

            return (
              <div
                key={fb.id}
                onClick={() => setSelectedFeedback(fb)}
                style={styles.card}
              >
                {/* Card Top Row */}
                <div style={styles.cardTop}>
                  <div style={styles.ratingStars}>
                    {'★'.repeat(fb.rating || 5)}
                    <span style={{ color: '#475569' }}>
                      {'☆'.repeat(5 - (fb.rating || 5))}
                    </span>
                  </div>

                  <span
                    style={{
                      ...styles.sentimentTag,
                      background: sentStyle.bg,
                      color: sentStyle.text,
                      border: `1px solid ${sentStyle.border}`,
                    }}
                  >
                    {fb.sentiment || 'Neutral'}
                  </span>

                  <span
                    style={{
                      ...styles.categoryTag,
                      color: catBadge.color,
                      border: `1px solid ${catBadge.color}33`,
                    }}
                  >
                    {catBadge.icon} {catBadge.label}
                  </span>

                  <span style={styles.timeTag}>
                    {new Date(fb.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Status Dropdown */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={styles.statusDropdownWrapper}
                  >
                    <select
                      value={fb.status || 'new'}
                      onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        background:
                          fb.status === 'resolved'
                            ? 'rgba(16,185,129,0.15)'
                            : fb.status === 'in_review'
                            ? 'rgba(245,158,11,0.15)'
                            : fb.status === 'ignored'
                            ? 'rgba(100,116,139,0.15)'
                            : 'rgba(6,182,212,0.15)',
                        color:
                          fb.status === 'resolved'
                            ? '#34D399'
                            : fb.status === 'in_review'
                            ? '#FBBF24'
                            : fb.status === 'ignored'
                            ? '#94A3B8'
                            : '#22D3EE',
                      }}
                    >
                      <option value="new">🆕 New</option>
                      <option value="in_review">👀 In Review</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="ignored">🚫 Ignored</option>
                    </select>
                  </div>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <h4 style={styles.summary}>{fb.summary}</h4>
                  <p style={styles.rawTranscript}>
                    🎙️ &ldquo;{fb.raw_transcript}&rdquo;
                  </p>

                  {fb.actionable_item && (
                    <div style={styles.actionableBox}>
                      <span style={styles.actionableIcon}>💡 Task:</span>
                      <span style={styles.actionableText}>{fb.actionable_item}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Quick Tags */}
                <div style={styles.cardFooter}>
                  <div style={styles.quickTagsList}>
                    {fb.quick_tags &&
                      fb.quick_tags.map((tag, idx) => (
                        <span key={idx} style={styles.tagPill}>
                          #{tag}
                        </span>
                      ))}
                  </div>

                  <div style={styles.contextMeta}>
                    {fb.page_pathname && (
                      <span style={styles.routeTag}>📍 {fb.page_pathname}</span>
                    )}
                    {fb.browser && (
                      <span style={styles.deviceTag}>💻 {fb.browser}</span>
                    )}
                    {fb.client_context?.consoleErrors &&
                      fb.client_context.consoleErrors.length > 0 && (
                        <span style={styles.errorTag}>
                          ⚠️ {fb.client_context.consoleErrors.length} Console Error(s)
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-Over AI Detail Drill-Down Modal ── */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px 40px',
    maxWidth: 1400,
    margin: '0 auto',
    color: '#F8FAFC',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  workspacePill: {
    display: 'inline-block',
    background: '#1E293B',
    color: '#06B6D4',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    margin: '6px 0 0',
  },
  refreshBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#F8FAFC',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  filterToolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '16px 20px',
    marginBottom: 24,
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 260px',
  },
  searchInput: {
    width: '100%',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 13,
    padding: '10px 36px 10px 14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    fontSize: 12,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 600,
  },
  filterPill: {
    border: '1px solid',
    borderRadius: 20,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  selectInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F8FAFC',
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none',
  },

  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, transform 0.1s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingStars: {
    color: '#FBBF24',
    fontSize: 16,
    letterSpacing: 2,
  },
  sentimentTag: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 12,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 12,
    background: 'rgba(15,23,42,0.8)',
  },
  timeTag: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 'auto',
  },
  statusDropdownWrapper: {
    marginLeft: 8,
  },
  statusSelect: {
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 8px',
    outline: 'none',
    cursor: 'pointer',
  },

  cardBody: {
    marginBottom: 14,
  },
  summary: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F8FAFC',
    margin: '0 0 6px',
    lineHeight: 1.4,
  },
  rawTranscript: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    margin: '0 0 10px',
    lineHeight: 1.5,
  },
  actionableBox: {
    background: 'rgba(99,102,241,0.08)',
    borderLeft: '3px solid #6366F1',
    padding: '8px 12px',
    borderRadius: '0 8px 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  actionableIcon: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 700,
  },
  actionableText: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: 500,
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid rgba(30,41,59,0.5)',
  },
  quickTagsList: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagPill: {
    background: '#1E293B',
    color: '#64748B',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 6,
    fontWeight: 600,
  },
  contextMeta: {
    display: 'flex',
    gap: 12,
    fontSize: 11,
    color: '#64748B',
  },
  routeTag: {
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  deviceTag: {
    color: '#64748B',
  },
  errorTag: {
    color: '#F87171',
    fontWeight: 600,
  },

  loadingBox: {
    textAlign: 'center',
    padding: '60px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#F8FAFC',
    margin: '0 0 6px',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 13,
    maxWidth: 420,
    margin: '0 auto',
  },
};
