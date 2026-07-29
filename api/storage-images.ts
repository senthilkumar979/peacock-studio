import {
  assertValidScreenshotStoragePath,
  verifyScreenshotAssetToken,
} from '../packages/shared/src/utils/screenshotAssetUrl';

const SCREENSHOTS_BUCKET = 'screenshots';

/**
 * Branded screenshot proxy.
 * Public URL (rewrite): /storage/images/:orgId/:documentId/:filename?token=...
 * Function URL:         /api/storage-images?orgId=&documentId=&filename=&token=
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const secret = process.env.SCREENSHOT_URL_SECRET ?? '';

  if (!token || !secret) {
    return new Response('Missing token.', { status: 400 });
  }

  const orgId = url.searchParams.get('orgId')?.trim() ?? '';
  const documentId = url.searchParams.get('documentId')?.trim() ?? '';
  const filename = url.searchParams.get('filename')?.trim() ?? '';
  if (!orgId || !documentId || !filename) {
    return new Response('Invalid path.', { status: 400 });
  }

  let storagePath: string;
  try {
    storagePath = assertValidScreenshotStoragePath(`${orgId}/${documentId}/${filename}`);
  } catch {
    return new Response('Invalid path.', { status: 400 });
  }

  let verified: { storagePath: string; expiresAt: number };
  try {
    verified = await verifyScreenshotAssetToken(token, secret);
  } catch {
    return new Response('Invalid or expired token.', { status: 403 });
  }

  if (verified.storagePath !== storagePath) {
    return new Response('Token does not match requested asset.', { status: 403 });
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    ''
  ).replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Screenshot proxy missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response('Server misconfigured.', { status: 500 });
  }

  const objectUrl = `${supabaseUrl}/storage/v1/object/${SCREENSHOTS_BUCKET}/${storagePath}`;
  const upstream = await fetch(objectUrl, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });

  if (!upstream.ok) {
    console.error('Screenshot upstream failed', upstream.status, storagePath);
    return new Response('Asset not found.', { status: upstream.status === 404 ? 404 : 502 });
  }

  const body = await upstream.arrayBuffer();
  const contentType = upstream.headers.get('content-type') || 'image/jpeg';

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
