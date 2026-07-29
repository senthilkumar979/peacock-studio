import { PEACOCK_APP_NAME } from '@/constants/branding';
import { buildSocialMetaTags } from '@/seo/socialMetaTags';
import type { RouteMeta } from '@/seo/routeMetaData';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderBotHtml(meta: RouteMeta): string {
  const tags = buildSocialMetaTags(meta)
    .map(
      (tag) =>
        `<meta ${tag.attr}="${escapeHtml(tag.key)}" content="${escapeHtml(tag.content)}" />`,
    )
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
    <p>${escapeHtml(meta.title)} — ${escapeHtml(PEACOCK_APP_NAME)}</p>
  </body>
</html>`;
}
