'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 3. ParticleRingVisualizer (Unboxed Cosmic Particle Ring Corona)
// Scaled with generous vertical breathing room to guarantee zero clipping
// ──────────────────────────────────────────────────────────────────────────────
interface RingParticle {
  baseAngle: number;
  radiusOffset: number;
  baseSize: number;
  orbitSpeed: number;
  noiseSeed: number;
  layer: number;
}

export function ParticleRingVisualizer({
  freqRef,
  isActive,
  height = 240,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<RingParticle[]>([]);
  const timeRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') setCanvasWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const count = 420;
    const pts: RingParticle[] = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        baseAngle: Math.random() * Math.PI * 2,
        radiusOffset: (Math.random() - 0.5) * 16,
        baseSize: Math.random() * 1.8 + 0.8,
        orbitSpeed: (Math.random() * 0.007 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        noiseSeed: Math.random() * 100,
        layer: Math.floor(Math.random() * 3),
      });
    }
    particlesRef.current = pts;

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getParticleColor = (angle: number): { hex: string; glow: string } => {
      let a = angle % (Math.PI * 2);
      if (a < 0) a += Math.PI * 2;
      const sinA = Math.sin(a);

      if (sinA < -0.35) {
        return { hex: '#00F0FF', glow: '#38BDF8' };
      } else if (sinA < 0.1) {
        return { hex: '#818CF8', glow: '#6366F1' };
      } else if (sinA < 0.6) {
        return { hex: '#F43F5E', glow: '#EC4899' };
      } else {
        return { hex: '#F97316', glow: '#EF4444' };
      }
    };

    const draw = () => {
      timeRef.current += 0.026;
      const W = canvas.width;
      const H = canvas.height;
      const centerX = W / 2;
      const centerY = H * 0.50; // Centered
      const baseRadius = Math.min(W * 0.18, H * 0.25); // ~55px radius

      ctx.clearRect(0, 0, W, H);

      const freq = freqRef.current;
      let sum = 0;
      for (let i = 0; i < freq.length; i++) sum += freq[i];
      const rawAmp = freq.length > 0 ? sum / (freq.length * 255) : 0;
      const amp = isActive ? Math.max(0.12, rawAmp * 2.8) : 0.06;

      ctx.save();

      // Cosmic Radial Aura
      const haloGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.25,
        centerX, centerY, baseRadius * 1.6
      );
      haloGrad.addColorStop(0, 'rgba(11, 17, 32, 0)');
      haloGrad.addColorStop(0.5, `rgba(6, 182, 212, ${0.08 + amp * 0.14})`);
      haloGrad.addColorStop(0.85, `rgba(244, 63, 94, ${0.05 + amp * 0.09})`);
      haloGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, W, H);

      // Render Particles
      ctx.globalCompositeOperation = 'lighter';

      particlesRef.current.forEach((p, idx) => {
        p.baseAngle += p.orbitSpeed * (1 + amp * 2.5);

        const wave1 = Math.sin(p.baseAngle * 6 + timeRef.current * 2.2 + p.noiseSeed);
        const wave2 = Math.cos(p.baseAngle * 10 - timeRef.current * 1.6);
        const wave3 = Math.sin(p.baseAngle * 16 + timeRef.current * 3.0) * 0.4;

        const fIdx = Math.floor((idx / particlesRef.current.length) * (freq.length * 0.75));
        const audioDisplacement = ((freq[fIdx] || 0) / 255) * 11 * amp;
        const turbulentOffset = (wave1 * 5 + wave2 * 3 + wave3 * 1.5) * (0.6 + amp * 1.2);

        const currentR = baseRadius + p.radiusOffset + turbulentOffset + audioDisplacement;
        const x = centerX + Math.cos(p.baseAngle) * currentR;
        const y = centerY + Math.sin(p.baseAngle) * currentR;

        const { hex, glow } = getParticleColor(p.baseAngle);
        const pulse = 0.5 + Math.sin(timeRef.current * 3 + p.noiseSeed) * 0.35 + amp * 0.25;
        const particleSize = p.baseSize * (1 + amp * 0.75);

        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.globalAlpha = Math.min(1, Math.max(0.15, pulse));
        ctx.shadowColor = glow;
        ctx.shadowBlur = 6 + amp * 8;
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
