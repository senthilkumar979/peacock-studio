import { extractHtmlPageTitle, isPublicHttpUrl } from '../../shared/src/utils/pageTitle';

const FETCH_TIMEOUT_MS = 5_000;
const MAX_HTML_BYTES = 256_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function readUrl(request: Request): string {
  const fromQuery = new URL(request.url).searchParams.get('url')?.trim() ?? '';
  return fromQuery;
}

export async function GET(request: Request): Promise<Response> {
  const url = readUrl(request);
  if (!isPublicHttpUrl(url)) {
    return jsonResponse({ error: 'Invalid URL' }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent':
          'Mozilla/5.0 (compatible; PeacockStudio/1.0; +https://peacockstudio.app) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!upstream.ok) return jsonResponse({ title: null });

    const contentType = upstream.headers.get('content-type') ?? '';
    if (contentType && !/html|xml|text\/plain/i.test(contentType)) {
      return jsonResponse({ title: null });
    }

    const html = await readLimitedText(upstream, MAX_HTML_BYTES);
    return jsonResponse({ title: extractHtmlPageTitle(html) });
  } catch {
    return jsonResponse({ title: null });
  } finally {
    clearTimeout(timeout);
  }
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  const raw = await response.arrayBuffer();
  const slice = raw.byteLength > maxBytes ? raw.slice(0, maxBytes) : raw;
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}
