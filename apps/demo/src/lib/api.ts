/**
 * SayPulse Universal API Resolver
 * Seamlessly resolves API endpoints between Localhost Dev (Port 8000) and Production Cloud (NextGen Multiverse Gateway)
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  return '';
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  return fetch(url, init);
}

export async function safeJson<T = any>(res: Response): Promise<{ ok: boolean; data: T; error?: string }> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        data: null as any,
        error: `Server returned non-JSON response (${res.status})`,
      };
    }
    const data = await res.json();
    return {
      ok: res.ok,
      data,
      error: !res.ok ? (data.error || `HTTP ${res.status}`) : undefined,
    };
  } catch (err: any) {
    return {
      ok: false,
      data: null as any,
      error: err?.message || 'Failed to parse JSON response',
    };
  }
}
