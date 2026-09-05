'use client';

import React from 'react';
import { AnimationVariant, VisualizerProps } from './types';
import { SiriWaveVisualizer } from './SiriWaveVisualizer';
import { NeuralSphereVisualizer } from './NeuralSphereVisualizer';
import { ParticleRingVisualizer } from './ParticleRingVisualizer';
import { NebulaPlasmaVisualizer } from './NebulaPlasmaVisualizer';
import { SolarRibbonVisualizer } from './SolarRibbonVisualizer';
import { LaserHorizonVisualizer } from './LaserHorizonVisualizer';

export interface AudioVisualizerProps extends VisualizerProps {
  variant: AnimationVariant;
}

export function AudioVisualizer({ variant, ...props }: AudioVisualizerProps) {
  switch (variant) {
    case 'neural-sphere':
      return <NeuralSphereVisualizer {...props} />;
    case 'particle-ring':
      return <ParticleRingVisualizer {...props} />;
    case 'nebula-plasma':
      return <NebulaPlasmaVisualizer {...props} />;
    case 'solar-ribbon':
      return <SolarRibbonVisualizer {...props} />;
    case 'laser-horizon':
      return <LaserHorizonVisualizer {...props} />;
    case 'siri-wave':
    default:
      return <SiriWaveVisualizer {...props} />;
  }
}

export * from './types';
