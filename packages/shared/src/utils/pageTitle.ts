import { validateResourceUrl } from './stepResource';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export const MAX_PAGE_TITLE_CHARS = 200;

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

export function extractHtmlPageTitle(html: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const property = (readAttr(tag, 'property') ?? readAttr(tag, 'name'))?.toLowerCase();
    if (property !== 'og:title' && property !== 'twitter:title') continue;
    const normalized = normalizeTitle(readAttr(tag, 'content'));
    if (normalized) return normalized;
  }

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return normalizeTitle(titleMatch?.[1]?.replace(/<[^>]+>/g, '') ?? '');
}

/** Blocks localhost and private/link-local literals before a server-side page fetch. */
export function isPublicHttpUrl(url: string): boolean {
  if (!validateResourceUrl(url)) return false;

  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (
      host === 'localhost' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }

    if (host.includes(':')) return false;

    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
      const octets = host.split('.').map(Number);
      const a = octets[0] ?? 0;
      const b = octets[1] ?? 0;
      if (a === 0 || a === 10 || a === 127) return false;
      if (a === 192 && b === 168) return false;
      if (a === 169 && b === 254) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function readAttr(tag: string, name: string): string | null {
  const doubleQuoted = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  if (doubleQuoted?.[1] != null) return doubleQuoted[1];
  const singleQuoted = new RegExp(`${name}\\s*=\\s*'([^']*)'`, 'i').exec(tag);
  return singleQuoted?.[1] ?? null;
}

function normalizeTitle(value: string | null | undefined): string | null {
  const decoded = decodeHtmlEntities(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!decoded) return null;
  return decoded.slice(0, MAX_PAGE_TITLE_CHARS);
}

function fromCodePoint(code: number): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return '';
  return String.fromCodePoint(code);
}
