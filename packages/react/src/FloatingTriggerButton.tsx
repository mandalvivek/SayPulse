'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSayPulse, TriggerStyle } from './SayPulseProvider';

// ──────────────────────────────────────────────────────────────────────────────
// FloatingTriggerButton
// Supports 6 customizable styles with scroll-aware auto-collapse.
// ──────────────────────────────────────────────────────────────────────────────
export function FloatingTriggerButton() {
  const { phase, setPhase, triggerStyle = 'pill-wave-voice', autoCollapse = true } = useSayPulse();
  const [hovered, setHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = phase === 'rating' || phase === 'sub_rating';

  // ── Scroll detection for auto-collapse ───────────────────────────────────
  useEffect(() => {
    if (!autoCollapse) {
      setIsScrolling(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [autoCollapse]);

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

  // Button should collapse if autoCollapse is active, scrolling is happening, and user is not hovering
  const isCollapsed = autoCollapse && isScrolling && !hovered && !isActive;

  // Render trigger contents according to triggerStyle
  const renderContent = () => {
    if (isActive) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span style={textStyle(false)}>Close</span>
        </span>
      );
    }

    switch (triggerStyle) {
      // 1. Hybrid Mix: Mic + Equalizer Waves + Feedback Text
      case 'pill-wave-voice':
        return (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="21" x2="12" y2="17" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
            <span style={equalizerWrapStyle(isCollapsed)}>
              <span className="sp-eq-bar sp-eq-1" />
              <span className="sp-eq-bar sp-eq-2" />
              <span className="sp-eq-bar sp-eq-3" />
              <span className="sp-eq-bar sp-eq-4" />
            </span>
            <span style={textStyle(isCollapsed)}>Feedback</span>
          </>
        );

      // 2. Chat Bubble + Waveform Soundbars
      case 'bubble-wave':
        return (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={equalizerWrapStyle(isCollapsed)}>
              <span className="sp-eq-bar sp-eq-1" />
              <span className="sp-eq-bar sp-eq-2" />
              <span className="sp-eq-bar sp-eq-3" />
            </span>
            <span style={textStyle(isCollapsed)}>Feedback</span>
          </>
        );

      // 3. Tab Corner: Sparkle + Feedback + Arrow
      case 'tab-corner':
        return (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
            <span style={textStyle(isCollapsed)}>Feedback</span>
            <svg style={{ ...arrowStyle(isCollapsed), flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        );

      // 4. Ultra Compact Micro Badge: Mic + Voice
      case 'badge-compact':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="21" x2="12" y2="17" />
              <line x1="9" y1="21" x2="15" y2="21" />
            </svg>
            <span style={textStyle(isCollapsed)}>Voice</span>
          </>
        );

      // 5. Headset Voice Memo
      case 'memo-voice':
        return (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span style={textStyle(isCollapsed)}>Voice Memo</span>
          </>
        );

      // 6. Vertical Edge Tab (Right Dock)
      case 'tab-vertical':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="21" x2="12" y2="17" />
            </svg>
            <span style={verticalTextStyle(isCollapsed)}>FEEDBACK</span>
          </>
        );

      default:
        return (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="21" x2="12" y2="17" />
            </svg>
            <span style={textStyle(isCollapsed)}>Feedback</span>
          </>
        );
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    const isVertical = triggerStyle === 'tab-vertical';

    if (isVertical) {
      return {
        position: 'fixed',
        top: '50%',
        right: 0,
        transform: `translateY(-50%) ${hovered ? 'scale(1.04) translateX(-2px)' : 'translateX(0)'}`,
        background: isActive
          ? 'linear-gradient(180deg, #6366F1, #8B5CF6)'
          : 'linear-gradient(180deg, #0F172A, #1E293B)',
        color: '#FFFFFF',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        borderRight: 'none',
        borderRadius: '8px 0 0 8px',
        padding: isCollapsed ? '10px 8px' : '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        boxShadow: '-4px 4px 20px rgba(0, 0, 0, 0.45)',
        zIndex: 10001,
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        userSelect: 'none',
      };
    }

    const baseBackground = () => {
      if (isActive) return 'linear-gradient(135deg, #6366F1, #8B5CF6)';
      if (triggerStyle === 'memo-voice') return 'linear-gradient(135deg, #4F46E5, #06B6D4)';
      if (triggerStyle === 'badge-compact') return 'linear-gradient(135deg, #0F172A, #1E293B)';
      if (triggerStyle === 'tab-corner') return 'linear-gradient(135deg, #0284C7, #06B6D4)';
      return 'linear-gradient(135deg, #06B6D4, #0284C7)';
    };

    return {
      position: 'fixed',
      bottom: 24,
      right: 24,
      height: triggerStyle === 'badge-compact' ? 38 : 46,
      minWidth: isCollapsed ? (triggerStyle === 'badge-compact' ? 38 : 46) : 'auto',
      padding: isCollapsed ? 0 : (triggerStyle === 'badge-compact' ? '0 14px' : '0 18px'),
      borderRadius: 9999,
      background: baseBackground(),
      color: '#FFFFFF',
      border: triggerStyle === 'badge-compact' ? '1px solid rgba(6,182,212,0.45)' : '1px solid rgba(255,255,255,0.22)',
      boxShadow: isActive
        ? '0 0 0 4px rgba(99,102,241,0.35), 0 10px 25px rgba(0,0,0,0.4)'
        : '0 8px 25px rgba(6,182,212,0.38), 0 4px 12px rgba(0,0,0,0.25)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isCollapsed ? 0 : 8,
      cursor: 'pointer',
      transform: hovered ? 'translateY(-2px) scale(1.04)' : 'translateY(0) scale(1)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 10001,
      outline: 'none',
      userSelect: 'none',
    };
  };

  return (
    <>
      <style>{`
        @keyframes sp-eq-anim-1 { 0%, 100% { height: 3px; } 50% { height: 12px; } }
        @keyframes sp-eq-anim-2 { 0%, 100% { height: 12px; } 50% { height: 4px; } }
        @keyframes sp-eq-anim-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
        @keyframes sp-eq-anim-4 { 0%, 100% { height: 10px; } 50% { height: 3px; } }

        .sp-eq-bar {
          width: 2px;
          border-radius: 2px;
          background-color: currentColor;
          display: inline-block;
          opacity: 0.9;
        }
        .sp-eq-1 { animation: sp-eq-anim-1 0.9s ease-in-out infinite; }
        .sp-eq-2 { animation: sp-eq-anim-2 0.7s ease-in-out infinite 0.15s; }
        .sp-eq-3 { animation: sp-eq-anim-3 1.1s ease-in-out infinite 0.3s; }
        .sp-eq-4 { animation: sp-eq-anim-4 0.8s ease-in-out infinite 0.2s; }
      `}</style>

      <button
        role="button"
        aria-label={isActive ? 'Close feedback widget' : 'Share voice feedback'}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKey}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={getContainerStyle()}
      >
        {renderContent()}
      </button>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-element animation & collapse style helpers
// ──────────────────────────────────────────────────────────────────────────────
function textStyle(collapsed: boolean): React.CSSProperties {
  return {
    maxWidth: collapsed ? 0 : 120,
    opacity: collapsed ? 0 : 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.01em',
  };
}

function verticalTextStyle(collapsed: boolean): React.CSSProperties {
  return {
    maxHeight: collapsed ? 0 : 120,
    opacity: collapsed ? 0 : 1,
    overflow: 'hidden',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    marginTop: collapsed ? 0 : 4,
  };
}

function equalizerWrapStyle(collapsed: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    height: 14,
    maxWidth: collapsed ? 0 : 30,
    opacity: collapsed ? 0 : 1,
    overflow: 'hidden',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
  };
}

function arrowStyle(collapsed: boolean): React.CSSProperties {
  return {
    maxWidth: collapsed ? 0 : 20,
    opacity: collapsed ? 0 : 1,
    overflow: 'hidden',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
  };
}
