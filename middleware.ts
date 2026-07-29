interface BotMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  robots: string;
}

const BOT_USER_AGENT =
  /bot|crawler|spider|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|embedly|quora link preview|vkshare|redditbot/i;

const SHARE_PATH = /^\/s\/([^/]+)(?:\/(?:embed|edit))?\/?$/;
const OG_IMAGE_WIDTH = '1000';
const OG_IMAGE_HEIGHT = '1000';
const OG_LOCALE = 'en_US';

interface MetaManifestEntry {
  title: string;
  description: string;
  canonical?: string;
  ogImage: string;
  robots: string;
}

type MetaManifest = Record<string, MetaManifestEntry>;

interface SharePreviewResponse {
  title: string;
  description: string;
  image?: string;
  url: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderBotHtml(meta: BotMeta): string {
  const image = meta.ogImage ?? '';
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Peacock Studio" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '',
    image ? `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />` : '',
    image ? `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />` : '',
    image ? `<meta property="og:image:alt" content="${escapeHtml(meta.title)}" />` : '',
    `<meta property="og:locale" content="${OG_LOCALE}" />`,
    meta.canonical ? `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : '',
    image ? `<meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const canonical = meta.canonical
    ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    ${canonical}
    ${tags}
  </head>
  <body>
    <p>${escapeHtml(meta.title)}</p>
  </body>
</html>`;
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

async function loadManifest(origin: string): Promise<MetaManifest> {
  const response = await fetch(`${origin}/meta-manifest.json`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return {};
  return (await response.json()) as MetaManifest;
}

async function fetchSharePreview(
  token: string,
  sharePath: string,
  origin: string,
): Promise<BotMeta | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;

  const previewUrl = new URL('/functions/v1/share-preview', supabaseUrl);
  previewUrl.searchParams.set('token', token);

  const response = await fetch(previewUrl.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as SharePreviewResponse;
  return {
    title: payload.title,
    description: payload.description,
    canonical: payload.url || `${origin}${sharePath}`,
    ogImage: payload.image,
    robots: 'noindex,nofollow',
  };
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!BOT_USER_AGENT.test(userAgent)) {
    return fetch(request);
  }

  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);
  const origin = url.origin;

  const shareMatch = pathname.match(SHARE_PATH);
  if (shareMatch) {
    const meta = await fetchSharePreview(shareMatch[1], pathname, origin);
    if (meta) {
      return new Response(renderBotHtml(meta), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return fetch(request);
  }

  const manifest = await loadManifest(origin);
  const entry = manifest[pathname];
  if (!entry) {
    return fetch(request);
  }

  return new Response(
    renderBotHtml({
      title: entry.title,
      description: entry.description,
      canonical: entry.canonical,
      ogImage: entry.ogImage,
      robots: entry.robots,
    }),
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/solutions/:path*',
    '/pricing',
    '/privacy',
    '/terms',
    '/install-extension',
    '/s/:path*',
  ],
};
