'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 5. SolarRibbonVisualizer (Unboxed Wide-Span Solar Corona + Ribbon Wings)
// Scaled with generous vertical breathing room to guarantee zero clipping
// ──────────────────────────────────────────────────────────────────────────────
export function SolarRibbonVisualizer({
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

    const coreRadius = 18;

    const draw = () => {
      timeRef.current += 0.026;
      const W = canvas.width;
      const H = canvas.height;
      const centerX = W / 2;
      const centerY = H * 0.50; // Centered

      ctx.clearRect(0, 0, W, H);

      const freq = freqRef.current;
      let sum = 0;
      for (let i = 0; i < freq.length; i++) sum += freq[i];
      const rawAmp = freq.length > 0 ? sum / (freq.length * 255) : 0;
      const amp = isActive ? Math.max(0.14, rawAmp * 2.8) : 0.05;

      ctx.save();

      // ── 1. Sweeping Magnetic Ribbons Across Full Width ────────────────────
      const RIBBON_SETS = [
        { color: '#00F0FF', alpha: 0.90, freq: 2.6, speed: 2.2, phase: 0.0, w: 2.4 },
        { color: '#38BDF8', alpha: 0.60, freq: 3.6, speed: 2.6, phase: 0.8, w: 1.6 },
        { color: '#818CF8', alpha: 0.45, freq: 4.8, speed: 1.8, phase: 1.6, w: 1.2 },
        { color: '#EC4899', alpha: 0.90, freq: 2.6, speed: 2.2, phase: 2.4, w: 2.4 },
        { color: '#F43F5E', alpha: 0.60, freq: 3.6, speed: 2.6, phase: 3.2, w: 1.6 },
        { color: '#C084FC', alpha: 0.45, freq: 4.8, speed: 1.8, phase: 4.0, w: 1.2 },
      ];

      ctx.globalCompositeOperation = 'lighter';

      RIBBON_SETS.forEach(({ color, alpha, freq: f, speed, phase, w }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        const maxH = (H * 0.32) * amp;
        const steps = Math.min(160, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;
          const side = normX < 0.5 ? -1 : 1;
          const distFromCenter = Math.abs(normX - 0.5) * 2;
          const taper = Math.sin(normX * Math.PI);

          const y =
            centerY +
            Math.sin(normX * Math.PI * f + timeRef.current * speed * side + phase) *
              maxH *
              taper *
              (0.35 + distFromCenter * 0.65);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // ── 2. Radiating Solar Corona Filament Spikes ─────────────────────────
      const spikeCount = 48;
      for (let i = 0; i < spikeCount; i++) {
        const theta = (i / spikeCount) * Math.PI * 2;
        const fIdx = Math.floor((i / spikeCount) * (freq.length * 0.7));
        const val = freq[fIdx] || 0;
        const spikeLen = (val / 255) * 20 * (1 + amp * 1.4) + (4 + Math.sin(timeRef.current * 3 + i) * 2.5);

        const x1 = centerX + Math.cos(theta) * (coreRadius - 2);
        const y1 = centerY + Math.sin(theta) * (coreRadius - 2);
        const x2 = centerX + Math.cos(theta) * (coreRadius + spikeLen);
        const y2 = centerY + Math.sin(theta) * (coreRadius + spikeLen);

        const isLeft = Math.cos(theta) < 0;
        const spikeColor = isLeft ? '#00F0FF' : '#EC4899';

        ctx.beginPath();
        ctx.strokeStyle = spikeColor;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.75 + amp * 0.25;
        ctx.shadowColor = spikeColor;
        ctx.shadowBlur = 8;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x2, y2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = spikeColor;
        ctx.fill();
      }

      // ── 3. Central Solar Core Orb ─────────────────────────────────────────
      ctx.globalCompositeOperation = 'source-over';
      const orbGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreRadius
      );
      orbGrad.addColorStop(0, '#1E293B');
      orbGrad.addColorStop(0.7, '#0B1120');
      orbGrad.addColorStop(1, '#00F0FF');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18 + amp * 14;
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#38BDF8';
      ctx.stroke();

      // Glowing Cyan Mic Icon in Core
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.roundRect(centerX - 2.5, centerY - 6, 5, 8, 2.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY - 1.5, 4.5, 0, Math.PI);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#00F0FF';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 3);
      ctx.lineTo(centerX, centerY + 6);
      ctx.stroke();

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
