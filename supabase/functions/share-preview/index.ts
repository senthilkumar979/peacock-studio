// Supabase Edge Function: public share OG/Twitter preview metadata (GET, no Turnstile).
// Deploy with verify_jwt=false — crawlers and edge middleware only need title/thumbnail.
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional: APP_ORIGIN (canonical share URL base)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const SCREENSHOTS_BUCKET = 'screenshots';
const SIGNED_URL_TTL_SECONDS = 3600;
const PREVIEW_RATE_LIMIT = 120;
const PREVIEW_RATE_WINDOW_SECONDS = 60;

const DEFAULT_TITLE = 'Peacock Studio';
const DEFAULT_DESCRIPTION =
  'Interactive workflow documentation shared from Peacock Studio.';
const DEFAULT_IMAGE_PATH = '/peacock-logo.png';

interface ShareLinkRow {
  token: string;
  organization_id: string;
  resource_type: 'document' | 'tour';
  resource_id: string;
  requires_auth: boolean;
  revoked_at: string | null;
  expires_at: string | null;
}

interface FlowDocumentRow {
  id: string;
  organization_id: string;
  flow: {
    flow?: { title?: string; description?: string };
  };
  steps: unknown;
}

interface ProductTourRow {
  id: string;
  organization_id: string;
  title: string;
  description: string;
}

interface FlowStepLike {
  screenshotId?: string;
  customScreenshotId?: string;
  event?: { screenshotId?: string };
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (req.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Server misconfigured' }, 500, cors);
    }

    const token = new URL(req.url).searchParams.get('token')?.trim();
    if (!token) {
      return json({ error: 'Missing token' }, 400, cors);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const rateKey = `${clientIp(req)}:share-preview`;
    const { data: allowed, error: rateError } = await admin.rpc('consume_edge_rate_limit', {
      p_bucket: 'share_preview',
      p_rate_key: rateKey,
      p_limit: PREVIEW_RATE_LIMIT,
      p_window_seconds: PREVIEW_RATE_WINDOW_SECONDS,
    });

    if (rateError) {
      console.error('rate limit error', rateError);
      return json({ error: 'Rate limit unavailable' }, 500, cors);
    }
    if (!allowed) {
      return json({ error: 'Too many requests' }, 429, cors);
    }

    const appOrigin = (Deno.env.get('APP_ORIGIN') ?? 'https://peacockstudio.app').replace(/\/$/, '');
    const shareUrl = `${appOrigin}/s/${token}`;
    const defaultImage = `${appOrigin}${DEFAULT_IMAGE_PATH}`;

    const { data: linkRow, error: linkError } = await admin
      .from('share_links')
      .select('token, organization_id, resource_type, resource_id, requires_auth, revoked_at, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (linkError) throw linkError;

    const link = linkRow as ShareLinkRow | null;
    if (!link || link.revoked_at) {
      return json(buildPreview(DEFAULT_TITLE, DEFAULT_DESCRIPTION, defaultImage, shareUrl), 404, cors);
    }
    if (link.expires_at && new Date(link.expires_at) <= new Date()) {
      return json(buildPreview(DEFAULT_TITLE, DEFAULT_DESCRIPTION, defaultImage, shareUrl), 404, cors);
    }
    if (link.requires_auth) {
      return json(
        buildPreview(
          'Sign in to view this guide',
          'This shared guide requires authentication.',
          defaultImage,
          shareUrl,
        ),
        200,
        cors,
      );
    }

    if (link.resource_type === 'tour') {
      const { data: tourRow, error: tourError } = await admin
        .from('product_tours')
        .select('id, organization_id, title, description')
        .eq('id', link.resource_id)
        .eq('organization_id', link.organization_id)
        .maybeSingle();
      if (tourError) throw tourError;

      const tour = tourRow as ProductTourRow | null;
      if (!tour) {
        return json(buildPreview(DEFAULT_TITLE, DEFAULT_DESCRIPTION, defaultImage, shareUrl), 404, cors);
      }

      return json(
        buildPreview(
          `${tour.title.trim() || 'Product tour'} · Peacock Studio`,
          stripHtml(tour.description).slice(0, 300) || DEFAULT_DESCRIPTION,
          defaultImage,
          shareUrl,
          'tour',
        ),
        200,
        cors,
      );
    }

    const { data: docRow, error: docError } = await admin
      .from('flow_documents')
      .select('id, organization_id, flow, steps')
      .eq('id', link.resource_id)
      .eq('organization_id', link.organization_id)
      .maybeSingle();
    if (docError) throw docError;

    const doc = docRow as FlowDocumentRow | null;
    if (!doc) {
      return json(buildPreview(DEFAULT_TITLE, DEFAULT_DESCRIPTION, defaultImage, shareUrl), 404, cors);
    }

    const title = doc.flow?.flow?.title?.trim() || 'Shared guide';
    const description =
      stripHtml(doc.flow?.flow?.description ?? '').slice(0, 300) || DEFAULT_DESCRIPTION;
    const screenshotId = findFirstScreenshotId(doc.steps);
    let image = defaultImage;

    if (screenshotId) {
      const { data: assetRow, error: assetError } = await admin
        .from('screenshot_assets')
        .select('storage_path')
        .eq('id', screenshotId)
        .eq('organization_id', link.organization_id)
        .maybeSingle();
      if (assetError) throw assetError;

      const storagePath = assetRow?.storage_path as string | undefined;
      if (storagePath) {
        const { data: signed, error: signError } = await admin.storage
          .from(SCREENSHOTS_BUCKET)
          .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
        if (signError) throw signError;
        if (signed?.signedUrl) image = signed.signedUrl;
      }
    }

    return json(
      buildPreview(`${title} · Peacock Studio`, description, image, shareUrl, 'document'),
      200,
      cors,
    );
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500, cors);
  }
});

function buildPreview(
  title: string,
  description: string,
  image: string,
  url: string,
  resourceType?: string,
) {
  return { title, description, image, url, resourceType };
}

function findFirstScreenshotId(steps: unknown): string | null {
  if (!Array.isArray(steps)) return null;

  for (const item of steps) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;

    if (record.kind === 'section' && Array.isArray(record.children)) {
      const nested = findFirstScreenshotId(record.children);
      if (nested) return nested;
      continue;
    }

    const step = record as FlowStepLike;
    const screenshotId = step.customScreenshotId || step.screenshotId || step.event?.screenshotId;
    if (typeof screenshotId === 'string' && screenshotId.trim()) {
      return screenshotId.trim();
    }
  }

  return null;
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = (Deno.env.get('APP_ORIGIN') ?? '').replace(/\/$/, '');
  const allowOrigin = allowed && origin === allowed ? origin : allowed || '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    Vary: 'Origin',
  };
}

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

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
