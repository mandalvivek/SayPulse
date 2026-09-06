export interface WaveformData {
  frequencies: Uint8Array;
  timestamp: number;
}

export interface AudioRecorderOptions {
  onWaveformData?: (data: WaveformData) => void;
  onError?: (error: Error) => void;
  fftSize?: number;
}

export interface AudioRecorderResult {
  transcript: string;
  durationMs: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// AudioRecorder
// Web Audio API for Siri waveform visualizer + SpeechRecognition for transcription.
// Fully resilient: handles mic permissions, speech recognition lifecycle, and
// guarantees stop() always resolves without hanging.
// ──────────────────────────────────────────────────────────────────────────────
export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private recognition: any = null;
  private isRecognitionRunning = false;
  private animFrameId: number | null = null;
  private startTime = 0;
  private finalTranscript = '';
  private interimTranscript = '';
  private options: AudioRecorderOptions;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = { fftSize: 128, ...options };
  }

  async start(): Promise<void> {
    try {
      this.finalTranscript = '';
      this.interimTranscript = '';

      // ── 1. Microphone access for waveform ──────────────────────────────────
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.fftSize ?? 128;
      source.connect(this.analyser);
      this.startWaveformLoop();

      // ── 2. Speech recognition ──────────────────────────────────────────────
      const SpeechRec =
        (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
        (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

      if (SpeechRec) {
        try {
          this.recognition = new SpeechRec();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang =
            typeof navigator !== 'undefined' && navigator.language
              ? navigator.language
              : 'en-US';

          this.recognition.onresult = (e: any) => {
            this.interimTranscript = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const text = e.results[i][0].transcript;
              if (e.results[i].isFinal) {
                this.finalTranscript += (this.finalTranscript ? ' ' : '') + text.trim();
              } else {
                this.interimTranscript += text;
              }
            }
          };

          this.recognition.onerror = (e: any) => {
            console.warn('[SayPulse AudioRecorder] SpeechRecognition error:', e.error);
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
              this.isRecognitionRunning = false;
            }
          };

          this.recognition.onend = () => {
            this.isRecognitionRunning = false;
          };

          this.recognition.start();
          this.isRecognitionRunning = true;
        } catch (recErr) {
          console.warn('[SayPulse AudioRecorder] Could not start speech recognition:', recErr);
          this.isRecognitionRunning = false;
        }
      }

      this.startTime = Date.now();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.options.onError?.(error);
      throw error;
    }
  }

  async stop(): Promise<AudioRecorderResult> {
    const durationMs = this.startTime > 0 ? Date.now() - this.startTime : 0;

    // Snapshot transcript immediately without blocking
    const transcript = (this.finalTranscript + ' ' + this.interimTranscript).trim();

    // Safely stop recognition and teardown audio in the background
    if (this.recognition && this.isRecognitionRunning) {
      try {
        this.recognition.stop();
      } catch {}
      this.isRecognitionRunning = false;
    }

    // Immediate cleanup
    this.cleanup();

    return {
      transcript,
      durationMs,
    };
  }

  private startWaveformLoop(): void {
    if (!this.analyser || !this.options.onWaveformData) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const loop = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      this.options.onWaveformData!({
        frequencies: new Uint8Array(dataArray),
        timestamp: Date.now(),
      });
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private cleanup(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.recognition = null;
    this.isRecognitionRunning = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  get isActive(): boolean {
    return this.stream !== null;
  }
}
