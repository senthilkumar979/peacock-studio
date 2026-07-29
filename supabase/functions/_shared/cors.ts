const LOCAL_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'] as const;

function parseConfiguredOrigins(): string[] {
  const raw = Deno.env.get('APP_ORIGIN') ?? '';
  return raw
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** CORS for browser calls to Edge Functions from the SPA (prod + Vite local dev). */
export function corsHeaders(
  req: Request,
  methods: string = 'POST, OPTIONS',
): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const configured = parseConfiguredOrigins();
  const allowed = new Set<string>([...configured, ...LOCAL_DEV_ORIGINS]);

  const allowOrigin =
    origin && allowed.has(origin)
      ? origin
      : configured[0] ?? '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': methods,
    Vary: 'Origin',
  };
}
