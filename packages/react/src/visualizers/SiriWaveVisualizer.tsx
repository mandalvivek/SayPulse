'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 1. SiriWaveVisualizer (Wide-Span Unboxed Siri Fluid Ribbons)
// ──────────────────────────────────────────────────────────────────────────────
export function SiriWaveVisualizer({
  freqRef,
  isActive,
  height = 240,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(800);

  const starsRef = useRef<{ x: number; y: number; s: number; a: number; v: number }[]>([]);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') {
        setCanvasWidth(window.innerWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const stars: { x: number; y: number; s: number; a: number; v: number }[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.2,
        v: Math.random() * 0.001 + 0.0004,
      });
    }
    starsRef.current = stars;

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const RIBBONS = [
      { color: '#00F0FF', alpha: 0.95, speed: 2.2, phase: 0.0, freq: 2.8, ampMult: 1.00, width: 2.8, glow: 16 },
      { color: '#6366F1', alpha: 0.85, speed: 2.8, phase: 0.9, freq: 3.4, ampMult: 0.85, width: 2.2, glow: 12 },
      { color: '#A855F7', alpha: 0.75, speed: 1.9, phase: 1.8, freq: 2.4, ampMult: 0.75, width: 2.0, glow: 12 },
      { color: '#EC4899', alpha: 0.65, speed: 3.2, phase: 2.7, freq: 4.2, ampMult: 0.60, width: 1.8, glow: 10 },
      { color: '#38BDF8', alpha: 0.50, speed: 1.5, phase: 3.6, freq: 2.0, ampMult: 0.50, width: 1.5, glow: 8  },
      { color: '#F43F5E', alpha: 0.40, speed: 2.5, phase: 4.5, freq: 4.8, ampMult: 0.40, width: 1.3, glow: 8  },
      { color: '#34D399', alpha: 0.35, speed: 3.6, phase: 5.4, freq: 3.2, ampMult: 0.35, width: 1.2, glow: 6  },
    ];

    const draw = () => {
      timeRef.current += 0.026;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const freq = freqRef.current;
      let sum = 0;
      for (let i = 0; i < freq.length; i++) sum += freq[i];
      const rawAmp = freq.length > 0 ? sum / (freq.length * 255) : 0;
      const amp = isActive ? Math.max(0.14, rawAmp * 3.0) : 0.06;

      ctx.save();

      // Ambient Stardust
      starsRef.current.forEach((st) => {
        st.x += st.v * (1 + amp * 2);
        if (st.x > 1) st.x = 0;
        const sx = st.x * W;
        const sy = st.y * H;
        const sa = st.a * (0.35 + Math.sin(timeRef.current * 2 + st.y * 10) * 0.3 + amp * 0.5);

        ctx.beginPath();
        ctx.arc(sx, sy, st.s, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.globalAlpha = Math.min(1, Math.max(0, sa));
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 5;
        ctx.fill();
      });

      // Additive Siri Ribbons
      ctx.globalCompositeOperation = 'lighter';

      RIBBONS.forEach(({ color, alpha, speed, phase, freq: f, ampMult, width: strokeW, glow }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeW;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow + amp * 10;

        const maxH = (H * 0.32) * amp * ampMult;
        const steps = Math.min(180, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;

          const envelope = Math.sin(normX * Math.PI);

          const y =
            H * 0.50 +
            (Math.sin(normX * Math.PI * f + timeRef.current * speed + phase) * 0.70 +
              Math.sin(normX * Math.PI * (f * 1.5) - timeRef.current * (speed * 0.6) + phase * 1.3) * 0.22 +
              Math.cos(normX * Math.PI * 2 + timeRef.current * 1.2) * 0.08) *
              maxH *
              envelope;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [freqRef, isActive, canvasWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={height}
      style={{
        display: 'block',
        width: '100%',
        height: `${height}px`,
        pointerEvents: 'none',
      }}
    />
  );
}
