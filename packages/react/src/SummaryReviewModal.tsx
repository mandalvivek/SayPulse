'use client';

import React, { useCallback, useState } from 'react';
import { useSayPulse } from './SayPulseProvider';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#10B981',
  Neutral: '#6366F1',
  Frustrated: '#F59E0B',
  Critical: '#EF4444',
};

const CATEGORY_LABELS: Record<string, string> = {
  Bug: '🐛 Bug',
  UX_Friction: '😤 UX Issue',
  Feature_Request: '💡 Feature Request',
  Performance: '⚡ Performance',
  Billing: '💳 Billing',
  General_Praise: '🌟 Praise',
};

// ──────────────────────────────────────────────────────────────────────────────
// SummaryReviewModal
// 3-Box Structured Layout with Tabular Comparison (What User Said vs AI Summary vs Actionable)
// ──────────────────────────────────────────────────────────────────────────────
export function SummaryReviewModal() {
  const {
    phase,
    setPhase,
    aiData,
    summary,
    setSummary,
    rawTranscript,
    client,
    rating,
    quickTags,
    harvester,
    routeHistory,
  } = useSayPulse();

  const [activeTab, setActiveTab] = useState<'comparison' | 'ai' | 'raw'>('comparison');
  const [activeTone, setActiveTone] = useState<'default' | 'short' | 'formal' | 'elaborated'>('default');
  const [toneLoading, setToneLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const isSubmitting = phase === 'submitting';
  const isSuccess = phase === 'success';

  // ── Tone rewrite ───────────────────────────────────────────────────────────
  const applyTone = useCallback(
    async (tone: 'short' | 'formal' | 'elaborated') => {
      if (!aiData) return;
      if (tone === activeTone) {
        setSummary(aiData.summary);
        setActiveTone('default');
        return;
      }

      const variation = aiData.tone_variations?.[tone];
      if (variation) {
        setSummary(variation);
        setActiveTone(tone);
        return;
      }

      setToneLoading(true);
      try {
        const { result } = await client.rewriteTone(summary, tone);
        setSummary(result);
        setActiveTone(tone);
      } catch {
        // Keep current summary
      } finally {
        setToneLoading(false);
      }
    },
    [aiData, activeTone, client, summary, setSummary],
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setPhase('submitting');
    try {
      const context = harvester.harvest(routeHistory);
      await client.submit({
        summary,
        raw_transcript: rawTranscript,
        rating,
        quickTags,
        category: aiData?.category,
        sentiment: aiData?.sentiment,
        actionable_item: aiData?.actionable_item,
        context,
      });
      setPhase('success');
      setTimeout(() => setPhase('idle'), 2600);
    } catch {
      setPhase('review');
    }
  };

  if (isSuccess) {
    return (
      <div style={styles.backdrop}>
        <div style={styles.modal}>
          <div style={styles.successEmoji}>🎉</div>
          <p style={styles.successTitle}>Feedback Submitted!</p>
          <p style={styles.successSub}>
            Thank you! Your feedback has been recorded and saved.
          </p>
        </div>
      </div>
    );
  }

  const effectiveRaw = rawTranscript?.trim() || (quickTags?.length ? `Selected tags: ${quickTags.join(', ')}` : '[Voice note processed]');

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerTitle}>Review Your Feedback</p>
            <p style={styles.headerSub}>Verify what was heard and how AI structured it</p>
          </div>
          <button
            aria-label="Close"
            onClick={() => setPhase('idle')}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        {/* ── Meta Chips Row (Category, Sentiment, Rating) ── */}
        <div style={styles.metaRow}>
          {aiData?.category && (
            <span style={styles.chip}>
              {CATEGORY_LABELS[aiData.category] ?? aiData.category}
            </span>
          )}
          {aiData?.sentiment && (
            <span
              style={{
                ...styles.chip,
                background: `${SENTIMENT_COLORS[aiData.sentiment]}18`,
                color: SENTIMENT_COLORS[aiData.sentiment] ?? '#6366F1',
                border: `1px solid ${SENTIMENT_COLORS[aiData.sentiment]}44`,
              }}
            >
              {aiData.sentiment}
            </span>
          )}
          {rating > 0 && (
            <span style={{ ...styles.chip, background: '#1E293B', color: '#FBBF24' }}>
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} ({rating}/5)
            </span>
          )}
        </div>

        {/* ── View Switcher Tabs ── */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('comparison')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'comparison' ? '#1E293B' : 'transparent',
              color: activeTab === 'comparison' ? '#06B6D4' : '#64748B',
              borderBottom: activeTab === 'comparison' ? '2px solid #06B6D4' : '2px solid transparent',
            }}
          >
            📊 Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'ai' ? '#1E293B' : 'transparent',
              color: activeTab === 'ai' ? '#06B6D4' : '#64748B',
              borderBottom: activeTab === 'ai' ? '2px solid #06B6D4' : '2px solid transparent',
            }}
          >
            ✨ AI Summary
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'raw' ? '#1E293B' : 'transparent',
              color: activeTab === 'raw' ? '#06B6D4' : '#64748B',
              borderBottom: activeTab === 'raw' ? '2px solid #06B6D4' : '2px solid transparent',
            }}
          >
            🎙️ What You Said
          </button>
        </div>

        {/* ── Tabular 2-Box Comparison View ── */}
        {activeTab === 'comparison' && (
          <div style={styles.tabularGrid}>
            {/* Box 1: What You Said */}
            <div style={styles.cardBox}>
              <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>🎙️ What You Said</span>
                <span style={styles.rawBadge}>Raw Transcript</span>
              </div>
              <p style={styles.rawText}>
                {effectiveRaw}
              </p>
            </div>

            {/* Box 2: AI Summary */}
            <div style={{ ...styles.cardBox, borderColor: '#38BDF844' }}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.cardLabel, color: '#38BDF8' }}>✨ AI Summary</span>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  style={styles.editBtn}
                >
                  {editMode ? '👁 View' : '✏️ Edit'}
                </button>
              </div>

              {editMode ? (
                <textarea
                  autoFocus
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  style={styles.summaryTextarea}
                />
              ) : (
                <p style={styles.summaryText}>{toneLoading ? 'Rewriting…' : summary}</p>
              )}

              {/* Tone Variation Chips */}
              <div style={styles.toneRow}>
                <span style={styles.toneLabel}>Tone:</span>
                {(['short', 'formal', 'elaborated'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => applyTone(tone)}
                    disabled={toneLoading}
                    style={{
                      ...styles.toneChip,
                      background: activeTone === tone ? '#06B6D4' : '#1E293B',
                      color: activeTone === tone ? '#fff' : '#94A3B8',
                      border: activeTone === tone ? '1px solid #06B6D4' : '1px solid #334155',
                    }}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Single Tab: AI Summary Focus ── */}
        {activeTab === 'ai' && (
          <div style={styles.cardBox}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardLabel, color: '#38BDF8' }}>✨ AI Synthesized Summary</span>
              <button onClick={() => setEditMode((v) => !v)} style={styles.editBtn}>
                {editMode ? '👁 View' : '✏️ Edit'}
              </button>
            </div>
            {editMode ? (
              <textarea
                autoFocus
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={styles.summaryTextarea}
              />
            ) : (
              <p style={styles.summaryText}>{toneLoading ? 'Rewriting…' : summary}</p>
            )}
            <div style={styles.toneRow}>
              <span style={styles.toneLabel}>Tone:</span>
              {(['short', 'formal', 'elaborated'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => applyTone(tone)}
                  disabled={toneLoading}
                  style={{
                    ...styles.toneChip,
                    background: activeTone === tone ? '#06B6D4' : '#1E293B',
                    color: activeTone === tone ? '#fff' : '#94A3B8',
                    border: activeTone === tone ? '1px solid #06B6D4' : '1px solid #334155',
                  }}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Single Tab: Raw Recorded Focus ── */}
        {activeTab === 'raw' && (
          <div style={styles.cardBox}>
            <div style={styles.cardHeader}>
              <span style={styles.cardLabel}>🎙️ Exact Spoken Audio Transcript</span>
              <span style={styles.rawBadge}>Recorded</span>
            </div>
            <p style={{ ...styles.rawText, minHeight: 80 }}>
              {effectiveRaw}
            </p>
          </div>
        )}

        {/* ── Box 3: Actionable Item ── */}
        {aiData?.actionable_item && (
          <div style={styles.actionBox}>
            <div style={styles.actionHeader}>
              <span style={styles.actionLabel}>💡 Actionable Recommendation</span>
              <span style={styles.actionTag}>Product Impact</span>
            </div>
            <p style={styles.actionText}>{aiData.actionable_item}</p>
          </div>
        )}

        {/* ── Footer Actions ── */}
        <div style={styles.footer}>
          <button onClick={() => setPhase('recording')} style={styles.reRecordBtn}>
            🎙️ Re-record
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitBtn}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Feedback →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  modal: {
    background: '#0F172A',
    borderRadius: 20,
    padding: '22px 24px 20px',
    width: '100%',
    maxWidth: 560,
    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    border: '1px solid #1E293B',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: 700,
    margin: 0,
  },
  headerSub: {
    color: '#64748B',
    fontSize: 12,
    margin: '2px 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
    lineHeight: 1,
  },
  metaRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    background: '#1E293B',
    color: '#94A3B8',
    border: '1px solid #334155',
  },

  tabBar: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid #1E293B',
    marginBottom: 12,
  },
  tabBtn: {
    border: 'none',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  tabularGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
  },
  cardBox: {
    background: '#1E293B',
    borderRadius: 12,
    padding: '12px 16px',
    border: '1px solid #334155',
    marginBottom: 8,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rawBadge: {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 12,
    color: '#64748B',
    fontSize: 10,
    padding: '2px 8px',
  },
  rawText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 1.5,
    margin: 0,
    fontStyle: 'italic',
  },

  summaryText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 1.55,
    margin: '0 0 10px',
  },
  summaryTextarea: {
    width: '100%',
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: 8,
    color: '#F1F5F9',
    fontSize: 13,
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginBottom: 10,
    boxSizing: 'border-box',
  },
  editBtn: {
    background: 'none',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#94A3B8',
    fontSize: 11,
    cursor: 'pointer',
    padding: '2px 8px',
  },

  toneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  toneLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 600,
  },
  toneChip: {
    fontSize: 11,
    borderRadius: 16,
    padding: '3px 10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  actionBox: {
    background: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: '12px 16px',
    marginBottom: 14,
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderLeft: '4px solid #6366F1',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTag: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: 600,
  },
  actionText: {
    color: '#E2E8F0',
    fontSize: 13,
    margin: 0,
    lineHeight: 1.5,
  },

  footer: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  reRecordBtn: {
    padding: '8px 16px',
    borderRadius: 10,
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94A3B8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  submitBtn: {
    padding: '8px 20px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  successEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  successTitle: {
    color: '#F1F5F9',
    fontSize: 17,
    fontWeight: 700,
    textAlign: 'center',
    margin: '0 0 6px',
  },
  successSub: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
  },
};
