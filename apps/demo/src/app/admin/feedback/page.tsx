'use client';

import React, { useEffect, useState } from 'react';
import { FeedbackDetailModal, FeedbackRecord } from '../components/FeedbackDetailModal';

export default function AdminFeedbackInboxPage() {
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
      const params = new URLSearchParams();
      if (sentiment !== 'all') params.set('sentiment', sentiment);
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);
      if (rating) params.set('rating', String(rating));
      if (search) params.set('search', search);

      const res = await fetch(`/saypulse/v1/admin/feedback?${params.toString()}`);
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
  }, [sentiment, category, rating, status, search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/saypulse/v1/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchFeedback();
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error('Failed updating status:', e);
    }
  };

  const SENTIMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Positive: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
    Neutral: { bg: 'rgba(99,102,241,0.12)', text: '#818CF8', border: 'rgba(99,102,241,0.3)' },
    Frustrated: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
    Critical: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: 'rgba(239,68,68,0.4)' },
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
    <div>
      {/* ── Page Header ── */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Live Feedback Inbox</h1>
          <p style={styles.pageSubtitle}>
            Filter, triage, and inspect AI-structured customer intelligence ({total} total)
          </p>
        </div>
        <button onClick={fetchFeedback} style={styles.refreshBtn}>
          ↻ Refresh Feed
        </button>
      </div>

      {/* ── Status Tabs ── */}
      <div style={styles.statusTabs}>
        {(['all', 'new', 'in_review', 'resolved'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatus(st)}
            style={{
              ...styles.statusTabBtn,
              color: status === st ? '#06B6D4' : '#64748B',
              borderBottom: status === st ? '2px solid #06B6D4' : '2px solid transparent',
              background: status === st ? 'rgba(6,182,212,0.06)' : 'transparent',
            }}
          >
            {st === 'all' ? 'All Feedback' : st === 'new' ? 'New (Unread)' : st === 'in_review' ? 'In Review' : '✓ Resolved'}
          </button>
        ))}
      </div>

      {/* ── Filter Toolbar ── */}
      <div style={styles.toolbar}>
        {/* Search */}
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search transcripts, AI summaries, or page URLs…"
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

        {/* Sentiment Filter Pills */}
        <div style={styles.filterPills}>
          {(['all', 'Critical', 'Frustrated', 'Neutral', 'Positive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              style={{
                ...styles.sentimentPill,
                background: sentiment === s ? '#06B6D4' : '#1E293B',
                color: sentiment === s ? '#fff' : '#94A3B8',
                borderColor: sentiment === s ? '#06B6D4' : '#334155',
              }}
            >
              {s === 'all' ? 'All Sentiments' : s === 'Critical' ? '🚨 Critical' : s === 'Frustrated' ? '😤 Frustrated' : s === 'Neutral' ? '😐 Neutral' : '🌟 Positive'}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.selectInput}
        >
          <option value="all">All Categories</option>
          <option value="Bug">🐛 Bug Reports</option>
          <option value="UX_Friction">😤 UX Friction</option>
          <option value="Feature_Request">💡 Feature Requests</option>
          <option value="Performance">⚡ Performance</option>
          <option value="General_Praise">🌟 General Praise</option>
        </select>

        {/* Rating Dropdown */}
        <select
          value={rating || ''}
          onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
          style={styles.selectInput}
        >
          <option value="">All Star Ratings</option>
          <option value="1">⭐ 1 Star</option>
          <option value="2">⭐⭐ 2 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
        </select>
      </div>

      {/* ── Feedback List / Table ── */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading feedback feed…</p>
        </div>
      ) : items.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyEmoji}>🔍</p>
          <p style={styles.emptyTitle}>No feedback matching your filters</p>
          <p style={styles.emptySub}>Try clearing search parameters or reset filters</p>
          <button
            onClick={() => {
              setSentiment('all');
              setCategory('all');
              setStatus('all');
              setRating(undefined);
              setSearch('');
            }}
            style={styles.resetBtn}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={styles.feedbackList}>
          {items.map((item) => {
            const sentimentStyle = SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.Neutral;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                style={styles.feedbackCard}
              >
                {/* Left Col: Rating & Sentiment */}
                <div style={styles.cardLeft}>
                  <div style={styles.starsRow}>
                    <span style={styles.stars}>
                      {'★'.repeat(item.rating || 0)}{'☆'.repeat(5 - (item.rating || 0))}
                    </span>
                    <span style={styles.ratingNumber}>({item.rating}/5)</span>
                  </div>
                  <span style={{ ...styles.sentimentTag, ...sentimentStyle }}>
                    {item.sentiment}
                  </span>
                  <span style={styles.dateText}>{formatDate(item.created_at)}</span>
                </div>

                {/* Middle Col: AI Summary & Spoken Text */}
                <div style={styles.cardMiddle}>
                  <div style={styles.categoryPathRow}>
                    <span style={styles.categoryBadge}>🏷️ {item.category}</span>
                    <span style={styles.pathBadge}>📍 {item.page_pathname || '/'}</span>
                    <span style={styles.deviceBadge}>💻 {item.browser} ({item.os})</span>
                  </div>

                  <p style={styles.summaryText}>{item.summary}</p>
                  <p style={styles.spokenSnippet}>
                    &ldquo;{item.raw_transcript}&rdquo;
                  </p>
                </div>

                {/* Right Col: Status & Drill-down button */}
                <div style={styles.cardRight} onClick={(e) => e.stopPropagation()}>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      borderColor:
                        item.status === 'resolved'
                          ? '#10B981'
                          : item.status === 'in_review'
                          ? '#F59E0B'
                          : '#334155',
                      color:
                        item.status === 'resolved'
                          ? '#10B981'
                          : item.status === 'in_review'
                          ? '#F59E0B'
                          : '#94A3B8',
                    }}
                  >
                    <option value="new">New</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">✓ Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>

                  <button
                    onClick={() => setSelectedFeedback(item)}
                    style={styles.inspectButton}
                  >
                    Inspect AI Drill-down ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Drill-Down Modal ── */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: '#64748B',
    fontSize: 14,
    margin: '4px 0 0',
  },
  refreshBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },

  statusTabs: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid #1E293B',
    marginBottom: 16,
  },
  statusTabBtn: {
    border: 'none',
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: '12px 16px',
    marginBottom: 20,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '6px 12px',
    flex: 1,
    minWidth: 260,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#F1F5F9',
    fontSize: 13,
    width: '100%',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    fontSize: 12,
  },

  filterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  sentimentPill: {
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 16,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  selectInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 10px',
    outline: 'none',
    cursor: 'pointer',
  },

  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    gap: 12,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #1E293B',
    borderTopColor: '#06B6D4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
  },

  emptyBox: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
    margin: '0 0 10px',
  },
  emptyTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 4px',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 13,
    margin: '0 0 16px',
  },
  resetBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
  },

  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  feedbackCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 14,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: 110,
    flexShrink: 0,
  },
  starsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  stars: {
    color: '#FBBF24',
    fontSize: 14,
  },
  ratingNumber: {
    color: '#64748B',
    fontSize: 11,
  },
  sentimentTag: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: 10,
    border: '1px solid',
    textAlign: 'center',
  },
  dateText: {
    color: '#475569',
    fontSize: 10,
  },

  cardMiddle: {
    flex: 1,
  },
  categoryPathRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 600,
    background: '#1E293B',
    padding: '2px 8px',
    borderRadius: 6,
  },
  pathBadge: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 600,
    background: 'rgba(6,182,212,0.1)',
    padding: '2px 8px',
    borderRadius: 6,
  },
  deviceBadge: {
    color: '#64748B',
    fontSize: 11,
  },
  summaryText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.45,
    margin: '0 0 6px',
  },
  spokenSnippet: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 1.4,
    fontStyle: 'italic',
    margin: 0,
  },

  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    flexShrink: 0,
  },
  statusSelect: {
    background: '#1E293B',
    border: '1px solid',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 8px',
    outline: 'none',
    cursor: 'pointer',
  },
  inspectButton: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
