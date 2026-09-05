export interface FeedbackSummary {
  summary: string;
  category:
    | 'Bug'
    | 'UX_Friction'
    | 'Feature_Request'
    | 'Performance'
    | 'Billing'
    | 'General_Praise';
  sentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Critical';
  actionable_item: string;
  tone_variations: {
    short: string;
    formal: string;
    elaborated: string;
  };
}

export interface ApiClientConfig {
  apiKey: string;
  baseUrl: string;
  maxRetries?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// ApiClient
// Zero-dependency fetch wrapper. Injects X-SayPulse-Key header, retries with
// exponential backoff, supports AbortController for cancellation.
// ──────────────────────────────────────────────────────────────────────────────
export class ApiClient {
  private readonly cfg: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.cfg = { maxRetries: 3, ...config };
  }

  private async post<T>(
    path: string,
    body: object,
    signal?: AbortSignal,
    attempt = 1,
  ): Promise<T> {
    try {
      const res = await fetch(`${this.cfg.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SayPulse-Key': this.cfg.apiKey,
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) {
        if (attempt < this.cfg.maxRetries && res.status >= 500) {
          await this.delay(200 * 2 ** attempt);
          return this.post<T>(path, body, signal, attempt + 1);
        }
        const text = await res.text();
        throw new Error(`[SayPulse API] ${res.status}: ${text}`);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      if (attempt < this.cfg.maxRetries) {
        await this.delay(200 * 2 ** attempt);
        return this.post<T>(path, body, signal, attempt + 1);
      }
      throw err;
    }
  }

  async summarize(
    transcript: string,
    context: object,
    signal?: AbortSignal,
  ): Promise<FeedbackSummary> {
    return this.post<FeedbackSummary>(
      '/saypulse/v1/feedback/summarize',
      { transcript, context },
      signal,
    );
  }

  async rewriteTone(
    summary: string,
    tone: 'short' | 'formal' | 'elaborated',
    signal?: AbortSignal,
  ): Promise<{ result: string }> {
    return this.post<{ result: string }>(
      '/saypulse/v1/feedback/tone',
      { summary, tone },
      signal,
    );
  }

  async submit(
    payload: object,
    signal?: AbortSignal,
  ): Promise<{ id: string; success: boolean }> {
    return this.post<{ id: string; success: boolean }>(
      '/saypulse/v1/feedback/submit',
      payload,
      signal,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
