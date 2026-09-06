import { NextRequest, NextResponse } from 'next/server';

const API_BACKEND = 'http://127.0.0.1:8000';

async function forwardRequest(req: NextRequest, path: string, method: string) {
  const search = req.nextUrl.search || '';
  const targetUrl = `${API_BACKEND}/saypulse/${path}${search}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = req.headers.get('X-SayPulse-Key');
    if (apiKey) headers['X-SayPulse-Key'] = apiKey;

    const authHeader = req.headers.get('Authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    let body: string | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const jsonBody = await req.json();
        body = JSON.stringify(jsonBody);
      } catch {
        // No body provided
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const textData = await response.text();
      return new NextResponse(textData, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }
  } catch (error: any) {
    console.error(`[SayPulse Proxy Error] Failed forwarding ${method} to ${targetUrl}:`, error?.message);
    return NextResponse.json(
      { error: 'Proxy forwarding failed', message: error?.message },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  return forwardRequest(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  return forwardRequest(req, path, 'POST');
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  return forwardRequest(req, path, 'PATCH');
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  return forwardRequest(req, path, 'PUT');
}
