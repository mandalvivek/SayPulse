'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  ApiClient,
  ContextHarvester,
  StorageBridge,
} from '@saypulse/core';
import { AnimationVariant, ANIMATION_VARIANTS } from './visualizers/types';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type WidgetPhase =
  | 'idle'
  | 'rating'
  | 'sub_rating'
  | 'recording'
  | 'processing'
  | 'review'
  | 'submitting'
  | 'success'
  | 'fallback';

export interface AiData {
  summary: string;
  category: string;
  sentiment: string;
  actionable_item: string;
  tone_variations: { short: string; formal: string; elaborated: string };
}

export type TriggerStyle =
  | 'pill-wave-voice'
  | 'bubble-wave'
  | 'tab-corner'
  | 'badge-compact'
  | 'memo-voice'
  | 'tab-vertical';

export interface SayPulseContextValue {
  phase: WidgetPhase;
  setPhase: (p: WidgetPhase) => void;
  rating: number;
  setRating: (r: number) => void;
  quickTags: string[];
  setQuickTags: (t: string[]) => void;
  summary: string;
  setSummary: (s: string) => void;
  rawTranscript: string;
  setRawTranscript: (t: string) => void;
  aiData: AiData | null;
  setAiData: (d: AiData | null) => void;
  client: ApiClient;
  harvester: ContextHarvester;
  routeHistory: string[];
  activeAnimation: AnimationVariant;
  animationIndex: number;
  setActiveAnimation: (v: AnimationVariant) => void;
  cycleNextAnimation: () => void;
  triggerStyle: TriggerStyle;
  setTriggerStyle: (s: TriggerStyle) => void;
  autoCollapse: boolean;
  setAutoCollapse: (v: boolean) => void;
}

export interface SayPulseProviderProps {
  apiKey: string;
  apiEndpoint?: string;
  animationVariant?: AnimationVariant | 'cycle' | 'random';
  triggerStyle?: TriggerStyle;
  autoCollapse?: boolean;
  children: React.ReactNode;
}

const STORAGE_CYCLE_KEY = 'saypulse_active_anim_index';

const ALL_VARIANTS: AnimationVariant[] = [
  'siri-wave',
  'neural-sphere',
  'particle-ring',
  'nebula-plasma',
  'solar-ribbon',
  'laser-horizon',
];

// ──────────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────────
const SayPulseContext = createContext<SayPulseContextValue | null>(null);

export function useSayPulse(): SayPulseContextValue {
  const ctx = useContext(SayPulseContext);
  if (!ctx) throw new Error('useSayPulse must be used inside <SayPulseProvider>');
  return ctx;
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────
export function SayPulseProvider({
  apiKey,
  apiEndpoint = 'http://localhost:8000',
  animationVariant = 'cycle',
  triggerStyle: initialTriggerStyle = 'pill-wave-voice',
  autoCollapse: initialAutoCollapse = true,
  children,
}: SayPulseProviderProps) {
  const [phase, setPhase] = useState<WidgetPhase>('idle');
  const [rating, setRating] = useState(0);
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [aiData, setAiData] = useState<AiData | null>(null);
  const [routeHistory, setRouteHistory] = useState<string[]>([]);

  const [activeAnimation, setActiveAnimation] = useState<AnimationVariant>('siri-wave');
  const [animationIndex, setAnimationIndex] = useState(0);

  const [triggerStyle, setTriggerStyle] = useState<TriggerStyle>(initialTriggerStyle);
  const [autoCollapse, setAutoCollapse] = useState<boolean>(initialAutoCollapse);

  // ── Sequential Animation Cycling across Page Refreshes ───────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (animationVariant && animationVariant !== 'cycle' && animationVariant !== 'random') {
      setActiveAnimation(animationVariant);
      const idx = ALL_VARIANTS.indexOf(animationVariant);
      setAnimationIndex(idx >= 0 ? idx : 0);
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_CYCLE_KEY);
      const prevIdx = raw !== null ? parseInt(raw, 10) : -1;
      const nextIdx = (prevIdx + 1) % ALL_VARIANTS.length;

      localStorage.setItem(STORAGE_CYCLE_KEY, String(nextIdx));
      setActiveAnimation(ALL_VARIANTS[nextIdx]);
      setAnimationIndex(nextIdx);
      console.log(`[SayPulse] Active Animation #${nextIdx + 1}/6:`, ALL_VARIANTS[nextIdx]);
    } catch (e) {
      console.warn('[SayPulse] Storage access error:', e);
    }
  }, [animationVariant]);

  const cycleNextAnimation = () => {
    const nextIndex = (animationIndex + 1) % ALL_VARIANTS.length;
    setAnimationIndex(nextIndex);
    setActiveAnimation(ALL_VARIANTS[nextIndex]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_CYCLE_KEY, String(nextIndex));
      } catch (_) {}
    }
  };

  const resolvedApiEndpoint =
    typeof window !== 'undefined' &&
    apiEndpoint.includes('localhost') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
      ? apiEndpoint.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname)
      : apiEndpoint;

  const clientRef = useRef(new ApiClient({ apiKey, baseUrl: resolvedApiEndpoint }));
  const harvesterRef = useRef(new ContextHarvester());

  // ── Track route history using Next.js usePathname ─────────────────────────
  const pathname = usePathname();
  useEffect(() => {
    StorageBridge.addRoute(pathname);
    const state = StorageBridge.load();
    setRouteHistory(state?.routeHistory ?? [pathname]);
  }, [pathname]);

  // ── Mount portal root in body & Expose Global Controller ─────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('saypulse-root')) {
      const root = document.createElement('div');
      root.id = 'saypulse-root';
      root.style.cssText =
        'position:fixed;top:0;left:0;width:0;height:0;z-index:999999;pointer-events:none;';
      document.body.appendChild(root);
    }

    if (typeof window !== 'undefined') {
      (window as any).SayPulse = {
        open: (targetPhase: WidgetPhase = 'rating') => {
          setPhase(targetPhase);
        },
        close: () => {
          setPhase('idle');
        },
        toggle: () => {
          setPhase((prev) => (prev === 'idle' ? 'rating' : 'idle'));
        },
        setLayout: (mode: 'card' | 'bottom-pill') => {
          if (mode === 'bottom-pill') {
            setPhase('recording');
          } else {
            setPhase('rating');
          }
        },
        setAnimation: (variant: AnimationVariant) => {
          setActiveAnimation(variant);
          const idx = ALL_VARIANTS.indexOf(variant);
          if (idx >= 0) setAnimationIndex(idx);
        },
        setTriggerStyle: (style: TriggerStyle) => {
          setTriggerStyle(style);
        },
        setAutoCollapse: (enable: boolean) => {
          setAutoCollapse(enable);
        },
        startRecording: () => {
          setPhase('recording');
        },
        stopRecording: () => {
          setPhase('review');
        },
        getPhase: () => phase,
      };

      (window as any).__SAYPULSE_OPEN = (mode?: string) => {
        setPhase(mode === 'bottom-pill' ? 'recording' : 'rating');
      };
      (window as any).__SAYPULSE_SET_ANIMATION = (v: AnimationVariant) => {
        setActiveAnimation(v);
        const idx = ALL_VARIANTS.indexOf(v);
        if (idx >= 0) setAnimationIndex(idx);
      };
      (window as any).__SAYPULSE_SET_LAYOUT = (mode: 'card' | 'bottom-pill') => {
        setPhase(mode === 'bottom-pill' ? 'recording' : 'rating');
      };
      (window as any).__SAYPULSE_SET_TRIGGER_STYLE = (s: TriggerStyle) => {
        setTriggerStyle(s);
      };
      (window as any).__SAYPULSE_SET_AUTO_COLLAPSE = (enable: boolean) => {
        setAutoCollapse(enable);
      };
    }

    return () => {
      harvesterRef.current.destroy();
    };
  }, [phase, setPhase, setActiveAnimation, setTriggerStyle, setAutoCollapse]);

  const value: SayPulseContextValue = {
    phase,
    setPhase,
    rating,
    setRating,
    quickTags,
    setQuickTags,
    summary,
    setSummary,
    rawTranscript,
    setRawTranscript,
    aiData,
    setAiData,
    client: clientRef.current,
    harvester: harvesterRef.current,
    routeHistory,
    activeAnimation,
    animationIndex,
    setActiveAnimation,
    cycleNextAnimation,
    triggerStyle,
    setTriggerStyle,
    autoCollapse,
    setAutoCollapse,
  };

  return (
    <SayPulseContext.Provider value={value}>
      {children}
    </SayPulseContext.Provider>
  );
}
