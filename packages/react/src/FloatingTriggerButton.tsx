'use client';

import React, { useState } from 'react';
import { useSayPulse } from './SayPulseProvider';

// ──────────────────────────────────────────────────────────────────────────────
// FloatingTriggerButton
// Fixed bottom-right mic trigger badge.
// ──────────────────────────────────────────────────────────────────────────────
export function FloatingTriggerButton() {
  const { phase, setPhase } = useSayPulse();
  const [hovered, setHovered] = useState(false);
  const isActive = phase === 'rating' || phase === 'sub_rating';

  const handleClick = () => {
    if (phase === 'idle') setPhase('rating');
    else if (phase === 'rating' || phase === 'sub_rating') setPhase('idle');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <style>{`
        @keyframes sp-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(6,182,212,0); }
        }
      `}</style>

      {/* Tooltip */}
      {hovered && (
        <div style={styles.tooltip}>
          {isActive ? 'Close' : 'Share Feedback'}
        </div>
      )}

      <button
        role="button"
        aria-label={isActive ? 'Close feedback widget' : 'Share your feedback'}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKey}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...styles.btn,
          background: isActive
            ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
            : 'linear-gradient(135deg,#06B6D4,#0891B2)',
          animation: isActive ? 'sp-pulse 1.5s ease-in-out infinite' : 'none',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {isActive ? (
          /* X icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="21" x2="12" y2="17" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
        )}
      </button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, background 0.2s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    outline: 'none',
    zIndex: 10001,
  },
  tooltip: {
    position: 'fixed',
    bottom: 94,
    right: 28,
    background: '#0F172A',
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px solid #1E293B',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    zIndex: 10001,
  },
};
