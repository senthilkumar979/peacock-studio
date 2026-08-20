// Supabase Edge Function: public share resolve gate (Turnstile + rate limit).
// Deploy with verify_jwt=false — public viewers and Clerk JWTs both use this path.
// Secrets: TURNSTILE_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
// Optional: APP_ORIGIN (CORS)
//
// Embed-channel shares skip Turnstile: third-party iframes cannot reliably complete
// Cloudflare challenges. Bot abuse is still limited by consume_edge_rate_limit.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { clientIp } from '../_shared/clientIp.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import {
  buildAppScreenshotUrl,
  signScreenshotAssetToken,
} from '../_shared/screenshotAssetUrl.ts';

const SCREENSHOTS_BUCKET = 'screenshots';
const SIGNED_URL_TTL_SECONDS = 3600;
const SHARE_RATE_LIMIT = 60;
const SHARE_RATE_WINDOW_SECONDS = 60;

type ShareAction = 'resolve' | 'flow' | 'tour' | 'persona' | 'screenshots';

interface ResolveShareBody {
  action?: ShareAction;
  token?: string;
  turnstileToken?: string;
  presentation?: 'embed' | 'share';
  documentId?: string;
  personaId?: string;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: 'Server misconfigured' }, 500, cors);
    }

    const body = (await req.json()) as ResolveShareBody;
    const action = body.action ?? 'resolve';
    const shareToken = body.token?.trim();
    const turnstileToken = body.turnstileToken?.trim();

    if (!shareToken) {
      return json({ error: 'Missing share token' }, 400, cors);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const screenshotUrlSecret = Deno.env.get('SCREENSHOT_URL_SECRET')?.trim();
    const rateKey = `${clientIp(req)}:${shareToken.slice(0, 8)}`;
    const { data: allowed, error: rateError } = await admin.rpc('consume_edge_rate_limit', {
      p_bucket: 'resolve_share',
      p_rate_key: rateKey,
      p_limit: SHARE_RATE_LIMIT,
      p_window_seconds: SHARE_RATE_WINDOW_SECONDS,
    });

    if (rateError) {
      // Fail open — a limiter outage must not block legitimate public shares.
      console.error('rate limit error (continuing)', rateError);
    } else if (allowed === false) {
      return json({ error: 'Too many requests' }, 429, cors);
    }

    // Peek channel with service role so we can skip Turnstile for real embed shares only
    // (do not trust client `presentation` alone).
    const { data: peek, error: peekError } = await admin.rpc('resolve_share_link', {
      p_token: shareToken,
    });
    if (peekError) throw peekError;

    const peekRow = asRecord(peek);
    if (!peekRow) {
      return json({ data: null }, 200, cors);
    }

    const isEmbedChannel = peekRow.channel === 'embed';
    if (!isEmbedChannel) {
      if (!turnstileToken) {
        return json({ error: 'Missing Turnstile token' }, 400, cors);
      }
      const turnstileOk = await verifyTurnstile(turnstileToken, clientIp(req));
      if (!turnstileOk) {
        return json({ error: 'Bot check failed' }, 403, cors);
      }
    }

    const authHeader = req.headers.get('Authorization');
    const userJwt = bearerToken(authHeader);
    const rpcClient =
      userJwt && userJwt !== anonKey && userJwt !== serviceRoleKey
        ? createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: `Bearer ${userJwt}` } },
          })
        : admin;

    if (action === 'resolve') {
      // Prefer caller-scoped resolve (auth-gated shares); fall back to peek for anon/embed.
      if (rpcClient === admin) {
        return json({ data: peek }, 200, cors);
      }
      const { data, error } = await rpcClient.rpc('resolve_share_link', { p_token: shareToken });
      if (error) throw error;
      return json({ data }, 200, cors);
    }

    if (action === 'flow') {
      const documentId = body.documentId?.trim();
      if (!documentId) return json({ error: 'Missing documentId' }, 400, cors);
      const { data, error } = await rpcClient.rpc('get_shared_flow_document', {
        p_token: shareToken,
        p_document_id: documentId,
      });
      if (error) throw error;

      const { data: resources, error: resourcesError } = await admin
        .from('step_resources')
        .select('id, document_id, step_id, url, label, sort_order, created_at')
        .eq('document_id', documentId)
        .order('sort_order', { ascending: true });
      if (resourcesError) throw resourcesError;

      const payload = asRecord(data) ?? {};
      return json(
        {
          data: {
            ...payload,
            stepResources: (resources ?? []).map((row) => ({
              id: row.id,
              documentId: row.document_id,
              stepId: row.step_id,
              url: row.url,
              ...(typeof row.label === 'string' && row.label.trim()
                ? { label: row.label.trim() }
                : {}),
              sortOrder: row.sort_order,
              createdAt: Date.parse(row.created_at),
            })),
          },
        },
        200,
        cors,
      );
    }

    if (action === 'tour') {
      const { data, error } = await rpcClient.rpc('get_shared_product_tour', {
        p_token: shareToken,
      });
      if (error) throw error;
      return json({ data }, 200, cors);
    }

    if (action === 'persona') {
      const personaId = body.personaId?.trim();
      if (!personaId) return json({ error: 'Missing personaId' }, 400, cors);
      const { data, error } = await rpcClient.rpc('get_shared_persona', {
        p_token: shareToken,
        p_persona_id: personaId,
      });
      if (error) throw error;
      return json({ data }, 200, cors);
    }

    if (action === 'screenshots') {
      const documentId = body.documentId?.trim();
      if (!documentId) return json({ error: 'Missing documentId' }, 400, cors);

      const { data, error } = await rpcClient.rpc('list_shared_screenshot_assets', {
        p_token: shareToken,
        p_document_id: documentId,
      });
      if (error) throw error;

      const assets = (data ?? []) as Array<{ id: string; storagePath: string }>;
      const urls: Record<string, string> = {};

      await Promise.all(
        assets.map(async (asset) => {
          if (screenshotUrlSecret) {
            const token = await signScreenshotAssetToken(
              asset.storagePath,
              screenshotUrlSecret,
              SIGNED_URL_TTL_SECONDS,
            );
            const appOrigin = (Deno.env.get('APP_ORIGIN') ?? 'https://peacockstudio.app')
              .replace(/\/$/, '');
            urls[asset.id] = buildAppScreenshotUrl(appOrigin, asset.storagePath, token);
            return;
          }

          const { data: signed, error: signError } = await admin.storage
            .from(SCREENSHOTS_BUCKET)
            .createSignedUrl(asset.storagePath, SIGNED_URL_TTL_SECONDS);
          if (signError) throw signError;
          if (signed?.signedUrl) urls[asset.id] = signed.signedUrl;
        }),
      );

      return json({ data: urls }, 200, cors);
    }

    return json({ error: 'Unknown action' }, 400, cors);
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
