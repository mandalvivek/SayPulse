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
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<1 | 2 | 3>(1);
  const [progressPercent, setProgressPercent] = useState(15);

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

  // ── Stop & AI Analysis (Optimized & Docked to Bottom-Right) ──────────────
  const handleStop = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // 1. Immediately halt recording animation and dock pill to bottom-right
    setIsRecording(false);
    setIsAnalysing(true);
    setAnalysisStep(1);
    setProgressPercent(35);

    try {
      let rawTranscript = '';
      if (recorderRef.current) {
        const res = await recorderRef.current.stop();
        rawTranscript = res.transcript;
      }

      console.log('[SayPulse] Finished recording. Raw transcript:', rawTranscript);
      setRawTranscript(rawTranscript);

      // Clean and normalize brand terms
      const { cleanText } = redactPii(rawTranscript);
      const context = harvester.harvest(routeHistory);

      // Step 2: Transition to Gemini AI synthesis
      setAnalysisStep(2);
      setProgressPercent(75);

      const result = await client.summarize(cleanText, {
        ...context,
        rating,
        quickTags,
      });

      // Step 3: Synthesis Complete
      setAnalysisStep(3);
      setProgressPercent(100);

      setTimeout(() => {
        setIsAnalysing(false);
        setAiData(result as any);
        setSummary(result.summary);
        setPhase('review');
      }, 220);
    } catch (err) {
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

  const getStepText = () => {
    switch (analysisStep) {
      case 1:
        return 'Finalizing transcript & securing PII…';
      case 2:
        return 'Synthesizing intelligence with Gemini AI…';
      case 3:
        return '✓ Summary Ready!';
      default:
        return 'Processing feedback…';
    }
  };

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
        @keyframes sp-dock-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>

      {/* ── 1. Tall Unboxed Animation Layer (Halts immediately when recording stops) ── */}
      {isRecording && (
        <div style={styles.unboxedAnimationLayer}>
          <AudioVisualizer
            variant={activeAnimation}
            freqRef={freqRef}
            isActive={isRecording}
            height={240}
          />
        </div>
      )}

      {/* ── 2. Opaque Control Dock / Bottom-Right Progress Dock ── */}
      {isAnalysing ? (
        <div style={styles.bottomRightDock}>
          <div style={styles.dockHeader}>
            <div style={styles.sparkleOrb}>✨</div>
            <div style={styles.progressMeta}>
              <span style={styles.stepBadge}>STAGE {analysisStep}/2</span>
              <span style={styles.analysingLabel}>{getStepText()}</span>
            </div>
          </div>
          <div style={styles.progressBarTrack}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
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
    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Docked at Bottom-Right corner during analysis
  bottomRightDock: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 320,
    maxWidth: 'calc(100vw - 48px)',
    background: '#0B1325',
    border: '1px solid rgba(6, 182, 212, 0.4)',
    borderRadius: 18,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(6, 182, 212, 0.2)',
    zIndex: 10001,
    fontFamily: 'Inter, system-ui, sans-serif',
    animation: 'sp-dock-pulse 2s ease-in-out infinite',
    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  dockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  sparkleOrb: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
    flexShrink: 0,
  },

  progressMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    overflow: 'hidden',
  },

  stepBadge: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 700,
    color: '#06B6D4',
    letterSpacing: 0.5,
  },

  analysingLabel: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 4,
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 2,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, #06B6D4, #6366F1)',
    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
};
