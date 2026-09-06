'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useParams } from 'next/navigation';

interface AnalyticsData {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  totalFeedback: number;
  averageCsat: number;
  openCriticalIssues: number;
  sentimentBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  topFrictionPages: Array<{ path: string; count: number; avgRating: number }>;
}

export default function TenantDashboardPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'demo';

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState<string>('sp_live_...');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, feedbackRes, keysRes] = await Promise.all([
          apiFetch(`/saypulse/v1/admin/analytics?slug=${slug}`),
          apiFetch(`/saypulse/v1/admin/feedback?slug=${slug}&limit=5`),
          apiFetch(`/saypulse/v1/admin/api-keys?slug=${slug}`),
        ]);

        const analytics = await analyticsRes.json();
        const feedback = await feedbackRes.json();
        const keys = await keysRes.json();

        setData(analytics);
        setRecentItems(feedback.items || []);
        if (Array.isArray(keys) && keys.length > 0) {
          setApiKey(keys[0].api_key);
        }
      } catch (err) {
        console.error('Failed loading tenant data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [slug]);

  const copyScriptTag = () => {
    const scriptTag = `<script src="https://cdn.saypulse.ai/v1/saypulse.min.js" data-key="${apiKey}" defer></script>`;
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>🎙️</div>
        <p style={{ color: '#64748B', marginTop: 12 }}>Loading {slug} intelligence dashboard…</p>
      </div>
    );
  }

  const isZeroState = !data || data.totalFeedback === 0;

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.workspacePill}>
            <span>🏢 {data?.organization.name || slug}</span>
            <span style={styles.slugBadge}>/admin/{slug}</span>
            <span style={styles.planBadge}>{(data?.organization.plan || 'PRO').toUpperCase()}</span>
          </div>
          <h1 style={styles.title}>Voice Intelligence & CSAT Overview</h1>
          <p style={styles.subtitle}>
            Real-time spoken feedback analytics, sentiment intelligence, and customer friction telemetry.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link href={`/admin/${slug}/feedback`} style={styles.secondaryBtn}>
            📋 Live Inbox ({data?.totalFeedback || 0})
          </Link>
          <Link href={`/admin/${slug}/widget-studio`} style={styles.primaryBtn}>
            🎨 Widget Studio
          </Link>
        </div>
      </div>

      {/* ── Zero-State Onboarding Banner (When newly registered with 0 feedback) ── */}
      {isZeroState ? (
        <div style={styles.zeroStateCard}>
          <div style={styles.zeroStateIcon}>🚀</div>
          <h2 style={styles.zeroStateTitle}>Welcome to your new SayPulse workspace!</h2>
          <p style={styles.zeroStateSub}>
            Your workspace is created and ready to receive customer voice feedback. Embed your 1-line script tag to start collecting AI-transcribed notes in real-time.
          </p>

          <div style={styles.embedBox}>
            <div style={styles.embedBoxHeader}>
              <span style={styles.embedLabel}>⚡ Universal 1-Line Embed Script</span>
              <button onClick={copyScriptTag} style={styles.copyEmbedBtn}>
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy Script Tag'}
              </button>
            </div>
            <pre style={styles.codeSnippet}>
              {`<script src="https://cdn.saypulse.ai/v1/saypulse.min.js" data-key="${apiKey}" defer></script>`}
            </pre>
          </div>

          <div style={styles.zeroStateActions}>
            <Link href={`/admin/${slug}/widget-studio`} style={styles.zeroActionBtn}>
              🎨 Customize Holographic Wave in Widget Studio ➔
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── 4 KPI Scorecards ── */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <span style={styles.kpiLabel}>AVERAGE CSAT</span>
                <span style={styles.kpiIcon}>⭐</span>
              </div>
              <div style={styles.kpiVal}>
                {data.averageCsat} <span style={{ fontSize: 16, color: '#64748B' }}>/ 5.0</span>
              </div>
              <div style={styles.kpiMeta}>Based on {data.totalFeedback} submissions</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <span style={styles.kpiLabel}>POSITIVE SENTIMENT</span>
                <span style={styles.kpiIcon}>✨</span>
              </div>
              <div style={{ ...styles.kpiVal, color: '#10B981' }}>
                {Math.round(((data.sentimentBreakdown.Positive || 0) / (data.totalFeedback || 1)) * 100)}%
              </div>
              <div style={styles.kpiMeta}>{data.sentimentBreakdown.Positive || 0} positive voice notes</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <span style={styles.kpiLabel}>TOTAL VOICE NOTES</span>
                <span style={styles.kpiIcon}>🎙️</span>
              </div>
              <div style={{ ...styles.kpiVal, color: '#06B6D4' }}>{data.totalFeedback}</div>
              <div style={styles.kpiMeta}>Processed with Gemini 3.6 Flash</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiTop}>
                <span style={styles.kpiLabel}>OPEN CRITICAL ISSUES</span>
                <span style={styles.kpiIcon}>🚨</span>
              </div>
              <div style={{ ...styles.kpiVal, color: data.openCriticalIssues > 0 ? '#F87171' : '#10B981' }}>
                {data.openCriticalIssues}
              </div>
              <div style={styles.kpiMeta}>Requires engineering attention</div>
            </div>
          </div>

          {/* ── Middle Grid: Sentiment Stream & Top Friction Pages ── */}
          <div style={styles.midGrid}>
            {/* Category Breakdown */}
            <div style={styles.cardBox}>
              <h3 style={styles.cardHeading}>Category Intelligence</h3>
              <p style={styles.cardSub}>Automatic classification by Gemini Flash</p>

              <div style={styles.categoryList}>
                {Object.entries(data.categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} style={styles.categoryRow}>
                    <span style={styles.catLabel}>{cat.replace('_', ' ')}</span>
                    <div style={styles.catBarWrapper}>
                      <div
                        style={{
                          ...styles.catBar,
                          width: `${(count / (data.totalFeedback || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={styles.catCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Friction Pages */}
            <div style={styles.cardBox}>
              <h3 style={styles.cardHeading}>Top Friction Pages</h3>
              <p style={styles.cardSub}>Routes with the highest concentration of frustrated users</p>

              <div style={styles.frictionList}>
                {data.topFrictionPages.length > 0 ? (
                  data.topFrictionPages.map((page, idx) => (
                    <div key={idx} style={styles.frictionRow}>
                      <span style={styles.frictionRank}>#{idx + 1}</span>
                      <div style={styles.frictionPath}>{page.path}</div>
                      <span style={styles.frictionCount}>{page.count} issues</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748B', fontSize: 13, padding: 20, textAlign: 'center' }}>
                    No friction pages reported yet! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Recent Voice Submissions Feed ── */}
          <div style={styles.feedBox}>
            <div style={styles.feedHeader}>
              <div>
                <h3 style={styles.cardHeading}>Recent Spoken Submissions</h3>
                <p style={styles.cardSub}>Latest voice notes with AI transcripts and context</p>
              </div>
              <Link href={`/admin/${slug}/feedback`} style={styles.viewAllBtn}>
                View All Feedback ➔
              </Link>
            </div>

            <div style={styles.feedbackItemsList}>
              {recentItems.map((item) => (
                <div key={item.id} style={styles.feedItem}>
                  <div style={styles.feedItemTop}>
                    <span style={styles.starText}>{'★'.repeat(item.rating || 5)}</span>
                    <span
                      style={{
                        ...styles.sentimentPill,
                        background:
                          item.sentiment === 'Positive'
                            ? 'rgba(16,185,129,0.15)'
                            : item.sentiment === 'Critical'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(245,158,11,0.15)',
                        color:
                          item.sentiment === 'Positive'
                            ? '#34D399'
                            : item.sentiment === 'Critical'
                            ? '#F87171'
                            : '#FBBF24',
                      }}
                    >
                      {item.sentiment}
                    </span>
                    <span style={styles.categoryPill}>{item.category}</span>
                    <span style={styles.timeText}>
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={styles.summaryText}>{item.summary}</div>
                  <div style={styles.rawText}>&ldquo;{item.raw_transcript}&rdquo;</div>
                </div>
              ))}
            </div>
          </div>
        </>
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
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    fontSize: 36,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  workspacePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  slugBadge: {
    background: '#1E293B',
    color: '#94A3B8',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  planBadge: {
    background: 'rgba(6,182,212,0.15)',
    color: '#22D3EE',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 800,
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
  headerActions: {
    display: 'flex',
    gap: 12,
  },
  primaryBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
  },
  secondaryBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#F8FAFC',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },

  zeroStateCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 20,
    padding: '48px 36px',
    textAlign: 'center',
    maxWidth: 760,
    margin: '40px auto',
  },
  zeroStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  zeroStateTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 8px',
    color: '#F8FAFC',
  },
  zeroStateSub: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '0 auto 24px',
    maxWidth: 580,
  },
  embedBox: {
    background: '#060913',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: '16px',
    textAlign: 'left',
    marginBottom: 24,
  },
  embedBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  embedLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 700,
  },
  copyEmbedBtn: {
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  codeSnippet: {
    margin: 0,
    color: '#38BDF8',
    fontSize: 12,
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  zeroStateActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  zeroActionBtn: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '20px 22px',
  },
  kpiTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  kpiIcon: {
    fontSize: 18,
  },
  kpiVal: {
    fontSize: 28,
    fontWeight: 800,
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  kpiMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  midGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  cardBox: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '22px',
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    color: '#F8FAFC',
  },
  cardSub: {
    color: '#64748B',
    fontSize: 12,
    margin: '3px 0 16px',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  catLabel: {
    width: 130,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 600,
  },
  catBarWrapper: {
    flex: 1,
    height: 8,
    background: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #06B6D4, #6366F1)',
    borderRadius: 4,
  },
  catCount: {
    width: 24,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 700,
    color: '#F8FAFC',
  },

  frictionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  frictionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1E293B',
    padding: '10px 14px',
    borderRadius: 10,
  },
  frictionRank: {
    color: '#F87171',
    fontWeight: 800,
    fontSize: 12,
  },
  frictionPath: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#F8FAFC',
  },
  frictionCount: {
    color: '#64748B',
    fontSize: 12,
  },

  feedBox: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '24px',
  },
  feedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllBtn: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
  },
  feedbackItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  feedItem: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '16px',
  },
  feedItemTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  starText: {
    color: '#FBBF24',
    fontSize: 14,
  },
  sentimentPill: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 6,
  },
  categoryPill: {
    fontSize: 11,
    background: '#0F172A',
    color: '#94A3B8',
    padding: '2px 8px',
    borderRadius: 6,
  },
  timeText: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#64748B',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  rawText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
};
