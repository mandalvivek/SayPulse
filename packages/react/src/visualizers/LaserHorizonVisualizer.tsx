'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 6. LaserHorizonVisualizer (Unboxed Wide-Span Horizon Laser + Radar Rings + Equalizer)
// Fixed: Beacon dot and radar rings positioned with generous top margin to prevent clipping
// ──────────────────────────────────────────────────────────────────────────────
export function LaserHorizonVisualizer({
  freqRef,
  isActive,
  height = 240,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') setCanvasWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.026;
      const W = canvas.width;
      const H = canvas.height;
      const centerX = W / 2;
      const horizonY = H * 0.54;

      ctx.clearRect(0, 0, W, H);

      const freq = freqRef.current;
      let sum = 0;
      for (let i = 0; i < freq.length; i++) sum += freq[i];
      const rawAmp = freq.length > 0 ? sum / (freq.length * 255) : 0;
      const amp = isActive ? Math.max(0.14, rawAmp * 2.8) : 0.05;

      ctx.save();

      // ── 1. Concentric Sonar Radar Wavefronts (Positioned safely at Y = H*0.22) ───
      const ringCenterY = H * 0.22; // ~52px down from top, leaving abundant top headroom
      const maxRadarR = H * 0.16;   // Max radius ~38px, so top edge is at 52 - 38 = 14px (never clips!)
      const ringCount = 4;

      for (let r = 0; r < ringCount; r++) {
        const progress = ((timeRef.current * 0.75 + r / ringCount) % 1);
        const radius = 6 + progress * maxRadarR * (1 + amp * 0.35);
        // Exponential fade-out before reaching boundaries
        const alpha = Math.pow(1 - progress, 1.4) * (0.5 + amp * 0.4);

        ctx.beginPath();
        ctx.arc(centerX, ringCenterY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // Central glowing beacon dot
      ctx.beginPath();
      ctx.arc(centerX, ringCenterY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 12 + amp * 8;
      ctx.fill();

      // ── 2. Laser Horizon Beam Across Full Screen ───────────────────────────
      ctx.globalCompositeOperation = 'lighter';

      const HARMONICS = [
        { color: '#00F0FF', alpha: 0.95, phase: 0.0, w: 2.4, f: 5.0, hMult: 1.00 },
        { color: '#818CF8', alpha: 0.75, phase: 0.9, w: 1.8, f: 7.0, hMult: 0.75 },
        { color: '#F43F5E', alpha: 0.60, phase: 1.8, w: 1.4, f: 9.0, hMult: 0.55 },
        { color: '#EC4899', alpha: 0.45, phase: 2.7, w: 1.0, f: 11.0, hMult: 0.35 },
      ];

      HARMONICS.forEach(({ color, alpha, phase, w, f, hMult }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + amp * 8;

        const maxSwell = (H * 0.22) * amp * hMult;
        const steps = Math.min(180, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;

          const dist = (normX - 0.5) * 4.2;
          const gaussian = Math.exp(-(dist * dist));

          const wave = Math.sin(normX * Math.PI * f + timeRef.current * 3.2 + phase);
          const y = horizonY - wave * maxSwell * gaussian;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // ── 3. Dynamic Equalizer Audio Spectrum Bars (Bottom Center) ───────────
      const barCount = 22;
      const barW = 3.5;
      const barGap = 4;
      const totalBarW = barCount * barW + (barCount - 1) * barGap;
      const startX = (W - totalBarW) / 2;
      const baseY = H - 14;

      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * (freq.length * 0.7));
        const val = freq[freqIndex] || 0;
        const barH = Math.max(3, (val / 255) * 20 * (1 + amp * 1.6) + (Math.sin(timeRef.current * 4 + i) * 1.5));

        const bx = startX + i * (barW + barGap);
        const by = baseY - barH;

        const norm = i / barCount;
        const color = norm < 0.4 ? '#00F0FF' : norm < 0.7 ? '#818CF8' : '#EC4899';

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.75 + amp * 0.25;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.roundRect(bx, by, barW, barH, 1.8);
        ctx.fill();
      }

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
