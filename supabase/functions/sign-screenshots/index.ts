// Supabase Edge Function: sign screenshot assets to app-domain URLs
// Auth: caller Bearer (Clerk JWT) → RLS on screenshot_assets by organization membership
// Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SCREENSHOT_URL_SECRET, APP_ORIGIN

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { clientIp } from '../_shared/clientIp.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { buildAppScreenshotUrl, signScreenshotAssetToken } from '../_shared/screenshotAssetUrl.ts';
const SIGNED_URL_TTL_SECONDS = 3600;

const SHARE_RATE_LIMIT = 60;
const SHARE_RATE_WINDOW_SECONDS = 60;

interface SignScreenshotsBody {
  documentId?: string;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const authHeader = req.headers.get('Authorization');
    const userJwt = bearerToken(authHeader);
    if (!userJwt) return json({ error: 'Unauthorized' }, 401, cors);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: 'Server misconfigured' }, 500, cors);
    }

    const body = (await req.json().catch(() => ({}))) as SignScreenshotsBody;
    const documentId = body.documentId?.trim();
    if (!documentId) return json({ error: 'Missing documentId' }, 400, cors);

    // Rate limit (service-role scoped)
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const rateKey = `${clientIp(req)}:${documentId}`;
    const { data: allowed, error: rateError } = await admin.rpc('consume_edge_rate_limit', {
      p_bucket: 'sign_screenshots',
      p_rate_key: rateKey,
      p_limit: SHARE_RATE_LIMIT,
      p_window_seconds: SHARE_RATE_WINDOW_SECONDS,
    });
    if (rateError) return json({ error: 'Rate limit unavailable' }, 500, cors);
    if (!allowed) return json({ error: 'Too many requests' }, 429, cors);

    const screenshotUrlSecret = Deno.env.get('SCREENSHOT_URL_SECRET')?.trim();
    const appOrigin = (Deno.env.get('APP_ORIGIN') ?? 'https://peacockstudio.app').replace(/\/$/, '');
    if (!screenshotUrlSecret) {
      return json({ error: 'Server misconfigured: SCREENSHOT_URL_SECRET' }, 500, cors);
    }

    const rpcClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
    });

    const { data: assets, error: assetError } = await rpcClient
      .from('screenshot_assets')
      .select('id, storage_path')
      .eq('document_id', documentId);

    if (assetError) throw assetError;
    if (!assets?.length) return json({ data: {} }, 200, cors);

    const urls: Record<string, string> = {};
    await Promise.all(
      (assets as Array<{ id: string; storage_path: string }>).map(async (asset) => {
        const token = await signScreenshotAssetToken(
          asset.storage_path,
          screenshotUrlSecret,
          SIGNED_URL_TTL_SECONDS,
        );
        urls[asset.id] = buildAppScreenshotUrl(appOrigin, asset.storage_path, token);
      }),
    );

    return json({ data: urls }, 200, cors);
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500, cors);
  }
});

function json(
  payload: Record<string, unknown>,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function bearerToken(header: string | null): string | null {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

