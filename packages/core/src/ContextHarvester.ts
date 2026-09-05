export interface HarvestedContext {
  url: string;
  pathname: string;
  title: string;
  referrer: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  connectionType: string;
  performanceMs: number;
  timestamp: string;
  recentErrors: string[];
  routeHistory: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// ContextHarvester
// Collects client-side metadata at the moment of feedback submission.
// Patches console.error to capture the last 5 errors silently.
// ──────────────────────────────────────────────────────────────────────────────
export class ContextHarvester {
  private errorBuffer: string[] = [];
  private readonly originalConsoleError: typeof console.error;

  constructor() {
    this.originalConsoleError = console.error;
    this.patchConsoleError();
  }

  private patchConsoleError(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      const msg = args.map((a) => String(a)).join(' ').slice(0, 300);
      this.errorBuffer.push(msg);
      if (this.errorBuffer.length > 5) this.errorBuffer.shift();
      this.originalConsoleError.apply(console, args);
    };
  }

  harvest(routeHistory: string[] = []): HarvestedContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;

    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      viewport: {
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
      },
      screen: {
        width: typeof window !== 'undefined' ? window.screen.width : 0,
        height: typeof window !== 'undefined' ? window.screen.height : 0,
      },
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connectionType: (conn?.effectiveType as string) ?? 'unknown',
      performanceMs: Math.round(performance.now()),
      timestamp: new Date().toISOString(),
      recentErrors: [...this.errorBuffer],
      routeHistory,
    };
  }

  destroy(): void {
    console.error = this.originalConsoleError;
  }
}
