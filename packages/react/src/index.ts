// @saypulse/react — public exports
export { SayPulseProvider, useSayPulse } from './SayPulseProvider';
export type {
  SayPulseProviderProps,
  SayPulseContextValue,
  WidgetPhase,
  AiData,
} from './SayPulseProvider';

export { SayPulseWidget } from './SayPulseWidget';
export { FloatingTriggerButton } from './FloatingTriggerButton';
export { StarRatingPopover } from './StarRatingPopover';
export { BottomMicPill } from './BottomMicPill';
export { SummaryReviewModal } from './SummaryReviewModal';

// Visualizers
export { AudioVisualizer } from './visualizers/AudioVisualizer';
export { SiriWaveVisualizer } from './visualizers/SiriWaveVisualizer';
export { NeuralSphereVisualizer } from './visualizers/NeuralSphereVisualizer';
export { ParticleRingVisualizer } from './visualizers/ParticleRingVisualizer';
export { NebulaPlasmaVisualizer } from './visualizers/NebulaPlasmaVisualizer';
export { SolarRibbonVisualizer } from './visualizers/SolarRibbonVisualizer';
export { LaserHorizonVisualizer } from './visualizers/LaserHorizonVisualizer';
export type { AnimationVariant, VisualizerProps } from './visualizers/types';
export { ANIMATION_VARIANTS } from './visualizers/types';
