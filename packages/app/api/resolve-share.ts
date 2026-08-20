/**
 * First-party proxy for public share resolution.
 * Browser URL: POST /api/resolve-share
 * Upstream:    POST ${SUPABASE_URL}/functions/v1/resolve-share
 *
 * Keeps share/embed flows on peacockstudio.app for corporate networks that block *.supabase.co.
 */

function resolveSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    ''
  ).replace(/\/$/, '');
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowOrigin = origin || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function jsonResponse(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request): Promise<Response> {
  const cors = corsHeaders(request);

  const supabaseUrl = resolveSupabaseUrl();
  if (!supabaseUrl) {
    console.error('resolve-share proxy missing SUPABASE_URL');
    return jsonResponse({ error: 'Server misconfigured' }, 500, cors);
  }

  const apikey = request.headers.get('apikey')?.trim() ?? '';
  const authorization = request.headers.get('Authorization')?.trim() ?? '';
  if (!apikey || !authorization) {
    return jsonResponse({ error: 'Missing apikey or Authorization' }, 400, cors);
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400, cors);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${supabaseUrl}/functions/v1/resolve-share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey,
        Authorization: authorization,
      },
      body,
    });
  } catch (cause) {
    console.error('resolve-share upstream fetch failed', cause);
    return jsonResponse({ error: 'Upstream unavailable' }, 502, cors);
  }

  const responseText = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? 'application/json';

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      ...cors,
      'Content-Type': contentType,
    },
  });
}
