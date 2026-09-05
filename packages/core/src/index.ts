// @saypulse/core — public exports
export { AudioRecorder } from './AudioRecorder';
export type {
  WaveformData,
  AudioRecorderOptions,
  AudioRecorderResult,
} from './AudioRecorder';

export { ContextHarvester } from './ContextHarvester';
export type { FeedbackContext, ConsoleError } from './ContextHarvester';

export { StorageBridge } from './StorageBridge';
export type { PersistedFeedbackState } from './StorageBridge';

export { ApiClient } from './ApiClient';
export type { FeedbackSummary, ApiClientConfig } from './ApiClient';

export { redactPii } from './PiiRedactor';
export type { RedactionResult } from './PiiRedactor';

export { TalkBackService } from './TalkBackService';
export { WakeWordListener } from './WakeWordListener';
export type { WakeWordOptions } from './WakeWordListener';
