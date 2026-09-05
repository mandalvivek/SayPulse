// ──────────────────────────────────────────────────────────────────────────────
// TalkBackService
// Premium Smooth Female Siri-Style Voice Engine
// Ultra-smooth, natural female voices (Google US English / Samantha / Ava / Jenny)
// with calm, warm acoustic parameters and speech cadence animation synchronization.
// ──────────────────────────────────────────────────────────────────────────────

export type SpeechCadenceCallback = (amplitude: number, frequencies: Uint8Array) => void;

export class TalkBackService {
  private static instance: TalkBackService | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private _isSpeaking = false;
  private cadenceInterval: any = null;
  private cadenceListeners = new Set<SpeechCadenceCallback>();
  private onSpeakingStateChangeListeners = new Set<(isSpeaking: boolean) => void>();

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
      setTimeout(() => this.initVoice(), 300);
      setTimeout(() => this.initVoice(), 1000);
    }
  }

  static getInstance(): TalkBackService {
    if (!this.instance) {
      this.instance = new TalkBackService();
    }
    return this.instance;
  }

  private isMaleVoice = (v: SpeechSynthesisVoice): boolean => {
    const n = v.name.toLowerCase();
    const MALE_NAMES = [
      'alex', 'fred', 'daniel', 'tom', 'oliver', 'george', 'ralph',
      'albert', 'bruce', 'rishi', 'male', 'david', 'mark', 'guy',
      'bad news', 'bells', 'cellos', 'deranged', 'good news', 'hysterical',
      'pipe organ', 'trinoids', 'whisper', 'zarvox', 'junior'
    ];
    return MALE_NAMES.some((m) => n.includes(m));
  };

  public initVoice = (): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const PREFERRED_SMOOTH_FEMALE_VOICES = [
      'Google US English',                // Chrome ultra-smooth studio female
      'Google UK English Female',
      'Ava (Premium)',                    // macOS modern Siri
      'Ava (Enhanced)',
      'Ava',
      'Samantha (Enhanced)',              // macOS Enhanced Siri
      'Samantha (Premium)',
      'Samantha',                         // macOS Classic Siri female
      'Microsoft Jenny Online (Natural)', // Edge / Windows Neural Female
      'Microsoft Aria Online (Natural)',
      'Microsoft Michelle Online (Natural)',
      'Nicky',
      'Victoria',
      'Susan',
      'Karen',
      'Moira',
      'Tessa',
      'Fiona',
      'Microsoft Zira',
    ];

    let foundVoice: SpeechSynthesisVoice | null = null;

    // 1. Exact priority list match
    for (const name of PREFERRED_SMOOTH_FEMALE_VOICES) {
      const match = voices.find(
        (v) => v.name.toLowerCase().includes(name.toLowerCase()) && v.lang.startsWith('en') && !this.isMaleVoice(v),
      );
      if (match) {
        foundVoice = match;
        break;
      }
    }

    // 2. Any female English voice
    if (!foundVoice) {
      foundVoice = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('natural')) &&
          v.lang.startsWith('en') &&
          !this.isMaleVoice(v),
      ) || null;
    }

    // 3. Any non-male English voice
    if (!foundVoice) {
      foundVoice = voices.find((v) => v.lang.startsWith('en') && !this.isMaleVoice(v)) || null;
    }

    // 4. Fallback: Samantha or voice 0
    if (!foundVoice) {
      foundVoice = voices.find((v) => v.name.toLowerCase().includes('samantha')) || voices[0];
    }

    this.selectedVoice = foundVoice;
    console.log('[SayPulse TalkBack] Selected Smooth Female Voice:', foundVoice?.name);
  };

  private notifySpeakingState = (speaking: boolean): void => {
    this._isSpeaking = speaking;
    if (this.onSpeakingStateChangeListeners) {
      this.onSpeakingStateChangeListeners.forEach((fn) => {
        try {
          fn(speaking);
        } catch (e) {
          console.warn('[SayPulse TalkBack] Listener error:', e);
        }
      });
    }
  };

  public speak = (text: string, onEnd?: () => void, onStart?: () => void): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    this.stopCadenceLoop();

    const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    this.initVoice();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Warm, feminine, smooth Siri parameters
    utterance.pitch = 1.08;
    utterance.rate = 0.98;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.notifySpeakingState(true);
      this.startCadenceLoop();
      onStart?.();
    };

    utterance.onend = () => {
      this.stopCadenceLoop();
      this.notifySpeakingState(false);
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('[SayPulse TalkBack] Speech error:', e);
      this.stopCadenceLoop();
      this.notifySpeakingState(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  public stop = (): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopCadenceLoop();
    this.notifySpeakingState(false);
  };

  public speakWakeWordGreeting = (onEnd?: () => void, onStart?: () => void): void => {
    this.speak("Hi there! I'm listening. Tell me what's on your mind.", onEnd, onStart);
  };

  public speakSummary = (summary: string, onEnd?: () => void, onStart?: () => void): void => {
    this.speak(`Here is what I've noted down: ${summary}. Feel free to review and submit.`, onEnd, onStart);
  };

  public speakSubmissionConfirmation = (onEnd?: () => void, onStart?: () => void): void => {
    this.speak("Thank you so much! Your feedback has been sent.", onEnd, onStart);
  };

  private startCadenceLoop = (): void => {
    const dummyFreq = new Uint8Array(64);
    let step = 0;

    this.cadenceInterval = setInterval(() => {
      if (!this._isSpeaking) return;
      step += 0.15;

      const syllable = Math.sin(step * 5) * Math.cos(step * 2.5);
      const isSyllableActive = syllable > -0.25;
      const baseAmp = isSyllableActive ? 0.32 + Math.random() * 0.4 : 0.08;

      for (let i = 0; i < dummyFreq.length; i++) {
        if (isSyllableActive) {
          const formant = Math.sin(i * 0.35 + step * 3.5) * 0.5 + 0.5;
          dummyFreq[i] = Math.min(255, Math.floor(baseAmp * 255 * formant));
        } else {
          dummyFreq[i] = Math.floor(Math.random() * 12);
        }
      }

      this.cadenceListeners.forEach((fn) => {
        try {
          fn(baseAmp, dummyFreq);
        } catch (_) {}
      });
    }, 40);
  };

  private stopCadenceLoop = (): void => {
    if (this.cadenceInterval) {
      clearInterval(this.cadenceInterval);
      this.cadenceInterval = null;
    }
    const silentFreq = new Uint8Array(64);
    this.cadenceListeners.forEach((fn) => {
      try {
        fn(0, silentFreq);
      } catch (_) {}
    });
  };

  public onCadence = (cb: SpeechCadenceCallback): (() => void) => {
    this.cadenceListeners.add(cb);
    return () => this.cadenceListeners.delete(cb);
  };

  public onSpeakingChange = (cb: (isSpeaking: boolean) => void): (() => void) => {
    this.onSpeakingStateChangeListeners.add(cb);
    return () => this.onSpeakingStateChangeListeners.delete(cb);
  };

  get currentVoiceName(): string {
    return this.selectedVoice?.name || 'Default Smooth Voice';
  }

  get speaking(): boolean {
    return this._isSpeaking;
  }
}
