// ──────────────────────────────────────────────────────────────────────────────
// WakeWordListener
// Low-overhead background speech listener for wake words ("Hey Kiaara", "Kiaara", etc.)
// Auto-restarts gracefully on browser silence timeouts.
// ──────────────────────────────────────────────────────────────────────────────

export interface WakeWordOptions {
  wakeKeywords?: RegExp[];
  onWakeWord: (detectedPhrase: string) => void;
  onError?: (err: Error) => void;
}

export class WakeWordListener {
  private recognition: any = null;
  private isListening = false;
  private isExplicitlyStopped = true;
  private options: WakeWordOptions;
  private restartTimeout: any = null;

  // Regex patterns matching various phonetic transcriptions of "Hey Kiaara"
  private defaultPatterns: RegExp[] = [
    /\b(?:hey|hi|ok|okay)?\s*(?:kia+ra|chia+ra|keya+ra|kiara)\b/i,
    /\b(?:hey|hi|ok|okay)\s*(?:tiara|keira|kira|kyra)\b/i,
  ];

  constructor(options: WakeWordOptions) {
    this.options = options;
  }

  start(): void {
    if (typeof window === 'undefined') return;

    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      console.warn('[SayPulse WakeWord] SpeechRecognition is not supported in this browser.');
      return;
    }

    this.isExplicitlyStopped = false;
    this.initRecognition(SpeechRec);
  }

  private initRecognition(SpeechRec: any): void {
    if (this.isExplicitlyStopped) return;

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (_) {}
      }

      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang =
        typeof navigator !== 'undefined' && navigator.language
          ? navigator.language
          : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        if (this.isExplicitlyStopped) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || '';
          if (this.checkMatch(transcript)) {
            console.log(`[SayPulse WakeWord] Match detected: "${transcript.trim()}"`);
            this.stop(); // Temporarily stop listener to avoid self-looping
            this.options.onWakeWord(transcript.trim());
            return;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[SayPulse WakeWord] SpeechRecognition error:', event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart loop unless explicitly stopped
        if (!this.isExplicitlyStopped) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (!this.isExplicitlyStopped) {
              this.initRecognition(SpeechRec);
            }
          }, 350);
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('[SayPulse WakeWord] Could not start listener:', err);
    }
  }

  private checkMatch(transcript: string): boolean {
    const patterns = this.options.wakeKeywords || this.defaultPatterns;
    return patterns.some((p) => p.test(transcript));
  }

  stop(): void {
    this.isExplicitlyStopped = true;
    this.isListening = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
  }

  get active(): boolean {
    return this.isListening;
  }
}
