'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizerProps } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// 2. NeuralSphereVisualizer (Unboxed 3D Holographic Constellation Orb)
// Scaled with generous vertical breathing room to guarantee zero clipping
// ──────────────────────────────────────────────────────────────────────────────
interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  pulsePhase: number;
}

export function NeuralSphereVisualizer({
  freqRef,
  isActive,
  height = 240,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const angleYRef = useRef(0);
  const angleXRef = useRef(0.25);
  const angleZRef = useRef(0.1);
  const pointsRef = useRef<Point3D[]>([]);
  const timeRef = useRef(0);
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== 'undefined') setCanvasWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const count = 95;
    const pts: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const jitter = 0.96 + Math.random() * 0.08;
      const x = Math.cos(theta) * radiusAtY * jitter;
      const z = Math.sin(theta) * radiusAtY * jitter;

      const isGold = i % 3 === 0 || i % 7 === 0;
      const color = isGold ? '#F59E0B' : '#00F0FF';
      const size = Math.random() * 1.5 + 1.2;

      pts.push({
        x,
        y: y * jitter,
        z,
        color,
        size,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    pointsRef.current = pts;

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
      const centerY = H * 0.50; // Perfect vertical center

      const freq = freqRef.current;
      let sum = 0;
      for (let i = 0; i < freq.length; i++) sum += freq[i];
      const rawAmp = freq.length > 0 ? sum / (freq.length * 255) : 0;
      const amp = isActive ? Math.max(0.12, rawAmp * 2.6) : 0.05;

      angleYRef.current += 0.016 + amp * 0.03;
      angleXRef.current += 0.006 + amp * 0.01;
      angleZRef.current += 0.003;

      ctx.clearRect(0, 0, W, H);

      // Scaled base radius with 50px+ breathing room
      const baseRadius = Math.min(W * 0.22, H * 0.28); // ~65px max
      const currentRadius = baseRadius * (1 + amp * 0.32);

      ctx.save();

      // Ambient Space Radial Glow around the sphere
      const bgGlow = ctx.createRadialGradient(
        centerX, centerY, currentRadius * 0.2,
        centerX, centerY, currentRadius * 1.6
      );
      bgGlow.addColorStop(0, `rgba(6, 182, 212, ${0.15 + amp * 0.22})`);
      bgGlow.addColorStop(0.5, `rgba(30, 58, 138, ${0.08 + amp * 0.12})`);
      bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);
      const cosZ = Math.cos(angleZRef.current);
      const sinZ = Math.sin(angleZRef.current);

      const projected = pointsRef.current.map((pt, idx) => {
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        let y1 = pt.y;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        const depth = 2.4;
        const scale = depth / (depth - z3 * 0.55);
        const px = centerX + x3 * currentRadius * scale;
        const py = centerY + y3 * currentRadius * scale;

        const alpha = Math.max(0.12, (z3 + 1.2) / 2.2);
        const fVal = freq[idx % freq.length] || 0;
        const nodeAudioBoost = (fVal / 255) * amp;

        return {
          px,
          py,
          z: z3,
          alpha,
          color: pt.color,
          size: pt.size,
          nodeAudioBoost,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Plexus lines
      ctx.globalCompositeOperation = 'lighter';
      const maxDist = currentRadius * 0.62;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = maxDist * maxDist;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * (0.35 + amp * 0.55);

            ctx.beginPath();
            const isGoldLine = p1.color === '#F59E0B' || p2.color === '#F59E0B';
            ctx.strokeStyle = isGoldLine ? '#FBBF24' : '#00F0FF';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = isGoldLine ? 1.0 : 0.8;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Nodes
      projected.forEach((p) => {
        const radius = (p.size * (p.z + 1.4) * 0.85) * (1 + p.nodeAudioBoost * 1.2 + amp * 0.4);

        ctx.beginPath();
        ctx.arc(p.px, p.py, radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.28 + amp * 0.35);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 + amp * 14;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#F59E0B' ? '#FDE68A' : '#E0F2FE';
        ctx.globalAlpha = Math.min(1, p.alpha * 1.3);
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
