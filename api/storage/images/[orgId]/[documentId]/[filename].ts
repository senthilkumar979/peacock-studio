import { createClient } from '@supabase/supabase-js';
import {
  SCREENSHOT_ASSET_PATH_PREFIX,
  assertValidScreenshotStoragePath,
  verifyScreenshotAssetToken,
} from '@peacock/shared';

const SCREENSHOTS_BUCKET = 'screenshots';

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const secret = process.env.SCREENSHOT_URL_SECRET ?? '';

  if (!token || !secret) {
    return new Response('Missing token.', { status: 400 });
  }

  // Because this file is under /api, rewrites will call it as:
  // /api/storage/images/{orgId}/{documentId}/{filename}
  const pathname = url.pathname.replace(/^\/+/, '');
  const prefix = `api${SCREENSHOT_ASSET_PATH_PREFIX}`.replace(/^\/+/, '');
  const relativePath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';

  if (!relativePath) {
    return new Response('Invalid path.', { status: 400 });
  }

  const storagePath = assertValidScreenshotStoragePath(relativePath);

  let verified: { storagePath: string; expiresAt: number };
  try {
    verified = await verifyScreenshotAssetToken(token, secret);
  } catch {
    return new Response('Invalid or expired token.', { status: 403 });
  }

  if (verified.storagePath !== storagePath) {
    return new Response('Token does not match requested asset.', { status: 403 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Server misconfigured.', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.storage.from(SCREENSHOTS_BUCKET).download(storagePath);
  if (error) {
    return new Response('Asset not found.', { status: 404 });
  }

  // Uploads are stored with contentType: image/jpeg
  return new Response(data as BodyInit, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

