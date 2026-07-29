const SCREENSHOT_ASSET_PATH_PREFIX = '/storage/images';
const SCREENSHOT_ASSET_URL_TTL_SECONDS = 3600;

const UUID =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const STORAGE_PATH_RE = new RegExp(`^${UUID}/${UUID}/${UUID}\\.png$`, 'i');

interface ScreenshotAssetTokenPayload {
  v: 1;
  p: string;
  e: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    utf8Bytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export function assertValidScreenshotStoragePath(storagePath: string): string {
  const normalized = storagePath.replace(/^\/+/, '').trim();
  if (!STORAGE_PATH_RE.test(normalized)) throw new Error('Invalid screenshot storage path.');
  return normalized;
}

export function buildAppScreenshotUrl(
  origin: string,
  storagePath: string,
  token: string,
): string {
  const path = assertValidScreenshotStoragePath(storagePath);
  const base = origin.replace(/\/$/, '');
  const url = new URL(`${base}${SCREENSHOT_ASSET_PATH_PREFIX}/${path}`);
  url.searchParams.set('token', token);
  return url.toString();
}

export async function signScreenshotAssetToken(
  storagePath: string,
  secret: string,
  ttlSeconds: number = SCREENSHOT_ASSET_URL_TTL_SECONDS,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  if (!secret.trim()) throw new Error('Screenshot URL secret is not configured.');
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('Screenshot URL TTL must be a positive number.');
  }

  const path = assertValidScreenshotStoragePath(storagePath);
  const payload: ScreenshotAssetTokenPayload = { v: 1, p: path, e: nowSeconds + Math.floor(ttlSeconds) };
  const payloadPart = toBase64Url(utf8Bytes(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, utf8Bytes(payloadPart));
  return `${payloadPart}.${toBase64Url(new Uint8Array(signature))}`;
}

