'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 4. NebulaPlasmaVisualizer (Unboxed Quantum Nebula Plasma Core)
// Scaled with generous vertical breathing room to guarantee zero clipping
// ──────────────────────────────────────────────────────────────────────────────
interface NebulaPhoton {
  orbitRadius: number;
  angle: number;
  orbitSpeed: number;
  radialVelocity: number;
  size: number;
  color: string;
  glowColor: string;
  seed: number;
}

export function NebulaPlasmaVisualizer({
  freqRef,
  isActive,
  height = 240,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const photonsRef = useRef<NebulaPhoton[]>([]);
  const timeRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') setCanvasWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const count = 260;
    const pts: NebulaPhoton[] = [];
    const PALETTE = [
      { color: '#00F0FF', glow: '#38BDF8' },
      { color: '#38BDF8', glow: '#60A5FA' },
      { color: '#818CF8', glow: '#6366F1' },
      { color: '#C084FC', glow: '#A855F7' },
      { color: '#F43F5E', glow: '#EC4899' },
      { color: '#E879F9', glow: '#D946EF' },
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = Math.random() * 32 + 4; // Scaled down for breathing room
      const pColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      pts.push({
        orbitRadius,
        angle,
        orbitSpeed: (Math.random() * 0.025 + 0.01) * (Math.random() > 0.4 ? 1 : -1),
        radialVelocity: Math.random() * 0.02 - 0.01,
        size: Math.random() * 2.0 + 0.8,
        color: pColor.color,
        glowColor: pColor.glow,
        seed: Math.random() * 100,
      });
    }
    photonsRef.current = pts;

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.024;
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
      ctx.globalCompositeOperation = 'lighter';

      // Plasma Core Flares
      const coreR = 14 + amp * 22;
      const plasmaGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreR * 2.2
      );
      plasmaGrad.addColorStop(0, `rgba(0, 240, 255, ${0.58 + amp * 0.42})`);
      plasmaGrad.addColorStop(0.35, `rgba(192, 132, 252, ${0.40 + amp * 0.4})`);
      plasmaGrad.addColorStop(0.7, `rgba(244, 63, 94, ${0.20 + amp * 0.22})`);
      plasmaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Quantum Photons
      photonsRef.current.forEach((p, idx) => {
        p.angle += p.orbitSpeed * (1 + amp * 3.2);

        const rDrift = Math.sin(timeRef.current * 1.8 + p.seed) * 6;
        const freqBucket = freq[idx % freq.length] || 0;
        const audioRadialBoost = (freqBucket / 255) * 12 * amp;
        const currentR = (p.orbitRadius + rDrift + audioRadialBoost) * (1 + amp * 0.65);

        const x =
          centerX +
          Math.cos(p.angle) * currentR * 1.4 +
          Math.sin(p.angle * 2 + timeRef.current * 1.5) * 6;
        const y =
          centerY +
          Math.sin(p.angle) * currentR * 0.95 +
          Math.cos(p.angle * 2 - timeRef.current * 1.5) * 4;

        const pulse = 0.5 + Math.sin(timeRef.current * 4 + p.seed) * 0.4 + amp * 0.3;
        const pSize = p.size * (1 + amp * 0.7);

        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.15, pulse));
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 8 + amp * 10;
        ctx.fill();
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
