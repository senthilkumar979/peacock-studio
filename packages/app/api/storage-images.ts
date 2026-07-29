const SCREENSHOTS_BUCKET = 'screenshots';

const UUID =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const STORAGE_PATH_RE = new RegExp(`^${UUID}/${UUID}/${UUID}\\.png$`, 'i');

interface ScreenshotAssetTokenPayload {
  v: 1;
  p: string;
  e: number;
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function assertValidScreenshotStoragePath(storagePath: string): string {
  const normalized = storagePath.replace(/^\/+/, '').trim();
  if (!STORAGE_PATH_RE.test(normalized)) {
    throw new Error('Invalid screenshot storage path.');
  }
  return normalized;
}

async function verifyScreenshotAssetToken(
  token: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<{ storagePath: string; expiresAt: number }> {
  if (!secret.trim()) throw new Error('Screenshot URL secret is not configured.');
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) {
    throw new Error('Invalid screenshot asset token.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    utf8Bytes(secret).buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signatureBytes = fromBase64Url(signaturePart);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes.buffer as ArrayBuffer,
    utf8Bytes(payloadPart).buffer as ArrayBuffer,
  );
  if (!valid) throw new Error('Invalid screenshot asset token signature.');

  let payload: ScreenshotAssetTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart))) as ScreenshotAssetTokenPayload;
  } catch {
    throw new Error('Invalid screenshot asset token payload.');
  }

  if (payload.v !== 1 || typeof payload.p !== 'string' || typeof payload.e !== 'number') {
    throw new Error('Unsupported screenshot asset token.');
  }
  if (payload.e <= nowSeconds) {
    throw new Error('Screenshot asset token expired.');
  }

  return {
    storagePath: assertValidScreenshotStoragePath(payload.p),
    expiresAt: payload.e,
  };
}

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
