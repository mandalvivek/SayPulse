import React from 'react';

export type AnimationVariant =
  | 'siri-wave'
  | 'neural-sphere'
  | 'particle-ring'
  | 'nebula-plasma'
  | 'solar-ribbon'
  | 'laser-horizon';

export interface VisualizerProps {
  freqRef: React.MutableRefObject<Uint8Array>;
  isActive: boolean;
  width?: number;
  height?: number;
}

export const ANIMATION_VARIANTS: { id: AnimationVariant; name: string; icon: string }[] = [
  { id: 'siri-wave',      name: 'Siri Wave',      icon: '🌊' },
  { id: 'neural-sphere',  name: 'Neural Sphere',  icon: '🌐' },
  { id: 'particle-ring',  name: 'Particle Ring',  icon: '🪐' },
  { id: 'nebula-plasma',  name: 'Nebula Plasma',  icon: '🌌' },
  { id: 'solar-ribbon',   name: 'Solar Ribbon',   icon: '☀️' },
  { id: 'laser-horizon',  name: 'Laser Horizon',  icon: '⚡' },
];
