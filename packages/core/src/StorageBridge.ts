export interface SessionState {
  sessionId: string;
  startedAt: string;
  rating: number | null;
  quickTags: string[];
  isRecording: boolean;
  routeHistory: string[];
}

export type PersistedFeedbackState = SessionState;

const KEY = '__saypulse_session__';

// ──────────────────────────────────────────────────────────────────────────────
// StorageBridge
// Persists partial feedback session state to sessionStorage so that an active
// recording survives SPA route navigation and browser back/forward.
// All methods are safe to call in SSR (server-side) environments.
// ──────────────────────────────────────────────────────────────────────────────
export class StorageBridge {
  static save(partial: Partial<SessionState>): void {
    if (typeof sessionStorage === 'undefined') return;
    try {
      const existing = StorageBridge.load() ?? StorageBridge.defaultState();
      sessionStorage.setItem(KEY, JSON.stringify({ ...existing, ...partial }));
    } catch (_) {
      // Quota exceeded or private mode — fail silently
    }
  }

  static load(): SessionState | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as SessionState) : null;
    } catch (_) {
      return null;
    }
  }

  static addRoute(pathname: string): void {
    const state = StorageBridge.load() ?? StorageBridge.defaultState();
    const history = state.routeHistory;
    if (history[history.length - 1] !== pathname) {
      history.push(pathname);
      if (history.length > 15) history.shift();
    }
    StorageBridge.save({ routeHistory: history });
  }

  static clear(): void {
    if (typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.removeItem(KEY);
    } catch (_) {}
  }

  static generateSessionId(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private static defaultState(): SessionState {
    return {
      sessionId: StorageBridge.generateSessionId(),
      startedAt: new Date().toISOString(),
      rating: null,
      quickTags: [],
      isRecording: false,
      routeHistory: [
        typeof window !== 'undefined' ? window.location.pathname : '/',
      ],
    };
  }
}
