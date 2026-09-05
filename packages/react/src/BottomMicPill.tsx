'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AudioRecorder, redactPii } from '@saypulse/core';
import { useSayPulse } from './SayPulseProvider';
import { AudioVisualizer } from './visualizers/AudioVisualizer';
import { ANIMATION_VARIANTS } from './visualizers/types';

// ──────────────────────────────────────────────────────────────────────────────
// BottomMicPill (Tall Unboxed Visualizer + Compact Opaque Bottom Control Dock)
// ──────────────────────────────────────────────────────────────────────────────
export function BottomMicPill() {
  const {
    setPhase,
    client,
    harvester,
    routeHistory,
    setAiData,
    setSummary,
    setRawTranscript,
    rating,
    quickTags,
    activeAnimation,
    animationIndex,
    cycleNextAnimation,
  } = useSayPulse();

  const [elapsed, setElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [analysingText, setAnalysingText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const freqRef = useRef<Uint8Array>(new Uint8Array(64));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentVariantInfo =
    ANIMATION_VARIANTS.find((v) => v.id === activeAnimation) || ANIMATION_VARIANTS[0];

  // ── Initialize Audio Recording ──────────────────────────────────────────
  useEffect(() => {
    const recorder = new AudioRecorder({
      fftSize: 256,
      onWaveformData: ({ frequencies }) => {
        freqRef.current = frequencies;
      },
      onError: (err) => {
        console.warn('[SayPulse] AudioRecorder error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPhase('fallback');
        }
      },
    });

    recorderRef.current = recorder;

    recorder
      .start()
      .then(() => {
        setIsRecording(true);
        timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      })
      .catch((err) => {
        console.warn('[SayPulse] Could not start audio recorder:', err);
        setPhase('fallback');
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setPhase]);

  // ── Stop & AI Analysis ──────────────────────────────────────────────────
  const handleStop = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsAnalysing(true);

    const phrases = [
      'Transcribing speech…',
      'Redacting sensitive info…',
      'Analyzing with Gemini AI…',
      'Synthesizing feedback summary…',
    ];
    let idx = 0;
    setAnalysingText(phrases[0]);
    const phraseTimer = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setAnalysingText(phrases[idx]);
    }, 800);

    try {
      let rawTranscript = '';
      if (recorderRef.current) {
        const res = await recorderRef.current.stop();
        rawTranscript = res.transcript;
      }

      console.log('[SayPulse] Finished recording. Raw transcript:', rawTranscript);
      setRawTranscript(rawTranscript);

      const { cleanText } = redactPii(rawTranscript);
      const context = harvester.harvest(routeHistory);

      const result = await client.summarize(cleanText, {
        ...context,
        rating,
        quickTags,
      });

      clearInterval(phraseTimer);
      setIsAnalysing(false);
      setAiData(result as any);
      setSummary(result.summary);
      setPhase('review');
    } catch (err) {
      clearInterval(phraseTimer);
      setIsAnalysing(false);
      console.warn('[SayPulse] Summarize error, applying smart client-side summary:', err);

      const fallbackSummary =
        rating > 0
          ? `User provided a ${rating}-star rating${quickTags.length ? ` mentioning: ${quickTags.join(', ')}` : ''}.`
          : 'User submitted product feedback.';

      setSummary(fallbackSummary);
      setAiData({
        summary: fallbackSummary,
        category: rating >= 4 ? 'General_Praise' : 'UX_Friction',
        sentiment: rating >= 4 ? 'Positive' : 'Neutral',
        actionable_item:
          rating >= 4
            ? 'Continue monitoring positive reception.'
            : 'Review experience friction points indicated by user tags.',
        tone_variations: {
          short: fallbackSummary,
          formal: `User recorded a rating of ${rating || 'N/A'} stars with associated feedback parameters.`,
          elaborated: `The user shared feedback highlighting a ${rating}-star overall experience and specific tags: ${quickTags.join(', ') || 'none specified'}.`,
        },
      });
      setPhase('review');
    }
  }, [client, harvester, routeHistory, rating, quickTags, setAiData, setPhase, setSummary, setRawTranscript]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <style>{`
        @keyframes sp-pulse-btn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.6), 0 8px 24px rgba(0,0,0,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(6,182,212,0), 0 8px 24px rgba(0,0,0,0.4); }
        }
        @keyframes sp-recblink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.85); }
        }
        @keyframes sp-dots {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
          40%            { transform: scale(1.1); opacity: 1;    }
        }
      `}</style>

      {/* ── 1. Tall Unboxed Animation Layer (240px) ── */}
      <div style={styles.unboxedAnimationLayer}>
        <AudioVisualizer
          variant={activeAnimation}
          freqRef={freqRef}
          isActive={isRecording}
          height={240}
        />
      </div>

      {/* ── 2. Simple Opaque Control Bar Dock at the Bottom ── */}
      {isAnalysing ? (
        <div style={styles.opaqueControlDock}>
          <div style={styles.dotRow}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...styles.dot, animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
          <span style={styles.analysingLabel}>{analysingText}</span>
        </div>
      ) : (
        <div style={styles.opaqueControlDock}>
          {/* Rec indicator & Timer */}
          <div style={styles.dockLeft}>
            <div style={styles.recDot} />
            <span style={styles.timer}>{formatTime(elapsed)}</span>
          </div>

          <div style={styles.divider} />

          {/* Animation Details & Next Button */}
          <button
            onClick={cycleNextAnimation}
            style={styles.animationDetailButton}
            title="Click to switch to the next animation style"
          >
            <span style={styles.animNumBadge}>{animationIndex + 1}/6</span>
            <span style={styles.animIcon}>{currentVariantInfo.icon}</span>
            <span style={styles.animName}>{currentVariantInfo.name}</span>
            <span style={styles.nextArrow}>⇄ Next</span>
          </button>

          <div style={styles.divider} />

          {/* Stop & Discard Buttons */}
          <div style={styles.dockRight}>
            <button
              aria-label="Stop recording and analyze"
              onClick={handleStop}
              style={styles.stopBtn}
              title="Stop & Analyze"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff">
                <rect x="1" y="1" width="10" height="10" rx="2" />
              </svg>
              <span style={styles.stopText}>Stop</span>
            </button>
            <button
              aria-label="Discard recording"
              onClick={() => setPhase('idle')}
              style={styles.closeBtn}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  unboxedAnimationLayer: {
    position: 'fixed',
    bottom: 60,
    left: 0,
    right: 0,
    width: '100vw',
    height: 240,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    overflow: 'visible',
  },

  opaqueControlDock: {
    position: 'fixed',
    bottom: 22,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 50,
    padding: '6px 14px 6px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
    zIndex: 10001,
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  dockLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  recDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#EF4444',
    animation: 'sp-recblink 1.2s ease-in-out infinite',
    flexShrink: 0,
    boxShadow: '0 0 6px #EF4444',
  },
  timer: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },

  divider: {
    width: 1,
    height: 20,
    background: '#334155',
    flexShrink: 0,
  },

  animationDetailButton: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 20,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  animNumBadge: {
    color: '#06B6D4',
    fontWeight: 700,
    fontSize: 11,
  },
  animIcon: {
    fontSize: 13,
  },
  animName: {
    color: '#F1F5F9',
    fontWeight: 600,
  },
  nextArrow: {
    color: '#94A3B8',
    fontSize: 11,
    marginLeft: 2,
  },

  dockRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  stopBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    flexShrink: 0,
    animation: 'sp-pulse-btn 2s ease-in-out infinite',
  },
  stopText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: 15,
    cursor: 'pointer',
    padding: '2px 6px',
    flexShrink: 0,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotRow: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#06B6D4',
    animation: 'sp-dots 1.2s ease-in-out infinite',
  },
  analysingLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: 500,
  },
};
