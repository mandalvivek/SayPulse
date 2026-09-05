'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSayPulse } from './SayPulseProvider';
import { FloatingTriggerButton } from './FloatingTriggerButton';
import { StarRatingPopover } from './StarRatingPopover';
import { BottomMicPill } from './BottomMicPill';
import { SummaryReviewModal } from './SummaryReviewModal';

// ──────────────────────────────────────────────────────────────────────────────
// SayPulseWidget
// Master container — renders all sub-components into the #saypulse-root portal.
// Only one phase renders at a time (state machine).
// ──────────────────────────────────────────────────────────────────────────────
export function SayPulseWidget() {
  const { phase } = useSayPulse();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('saypulse-root');
    if (el) setPortalRoot(el);
  }, []);

  if (!portalRoot) return null;

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {/* Always show the trigger button (hidden during processing/submitting) */}
      {(phase === 'idle' || phase === 'rating' || phase === 'sub_rating') && (
        <FloatingTriggerButton />
      )}

      {/* Rating popover */}
      {(phase === 'rating' || phase === 'sub_rating') && (
        <StarRatingPopover />
      )}

      {/* Mic pill — handles both recording + analysing UI internally */}
      {phase === 'recording' && <BottomMicPill />}

      {/* Fallback text input — shown when mic permission denied */}
      {phase === 'fallback' && <FallbackTextInput />}

      {/* Summary review modal */}
      {(phase === 'review' || phase === 'submitting' || phase === 'success') && (
        <SummaryReviewModal />
      )}
    </div>,
    portalRoot,
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FallbackTextInput — shown when mic permission is denied
// ──────────────────────────────────────────────────────────────────────────────
function FallbackTextInput() {
  const { setPhase, client, harvester, routeHistory, setAiData, setSummary } =
    useSayPulse();
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const context = harvester.harvest(routeHistory);
      const result = await client.summarize(text, context);
      setAiData(result as any);
      setSummary(result.summary);
      setPhase('review');
    } catch {
      setPhase('idle');
    }
  };

  return (
    <div style={styles.fallback}>
      <div style={styles.fallbackCard}>
        <p style={styles.fallbackTitle}>✍️ Type your feedback</p>
        <p style={styles.fallbackSub}>Mic access was denied — type instead.</p>
        <textarea
          autoFocus
          rows={4}
          placeholder="Describe your experience..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />
        <div style={styles.fallbackActions}>
          <button onClick={() => setPhase('idle')} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            style={styles.submitBtn}
          >
            {loading ? 'Analysing...' : 'Analyse →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ProcessingOverlay
// ──────────────────────────────────────────────────────────────────────────────
function ProcessingOverlay() {
  return (
    <div style={styles.processingWrap}>
      <div style={styles.processingCard}>
        <div style={styles.spinner} />
        <p style={styles.processingText}>Analysing your feedback with AI…</p>
        <p style={styles.processingSubtext}>Usually takes 1–2 seconds</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  fallback: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 10000,
  },
  fallbackCard: {
    background: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: 360,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  fallbackTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: 600,
    margin: '0 0 4px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  fallbackSub: {
    color: '#64748B',
    fontSize: 13,
    margin: '0 0 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  textarea: {
    width: '100%',
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F1F5F9',
    padding: '10px 12px',
    fontSize: 14,
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  fallbackActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  submitBtn: {
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#06B6D4',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  processingWrap: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 10000,
  },
  processingCard: {
    background: '#1E293B',
    borderRadius: 16,
    padding: '32px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #1E40AF',
    borderTop: '3px solid #06B6D4',
    borderRadius: '50%',
    animation: 'sp-spin 0.8s linear infinite',
  },
  processingText: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  processingSubtext: {
    color: '#64748B',
    fontSize: 12,
    margin: 0,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};
