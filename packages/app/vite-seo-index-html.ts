import type { Plugin } from 'vite';
import {
  APPLE_TOUCH_ICON_PATH,
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_META_DESCRIPTION,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OG_LOCALE,
  ogImageUrl,
  SITE_NAME,
  SITE_ORIGIN,
} from './src/constants/seoDefaults.ts';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Injects canonical SEO / OG / Twitter defaults from `seoDefaults.ts` into index.html at build time. */
export function seoIndexHtmlPlugin(): Plugin {
  const title = escapeHtml(DEFAULT_DOCUMENT_TITLE);
  const description = escapeHtml(DEFAULT_META_DESCRIPTION);
  const canonical = `${SITE_ORIGIN}/`;
  const ogImage = escapeHtml(ogImageUrl());

  return {
    name: 'peacock-seo-index-html',
    transformIndexHtml(html) {
      return html
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
          `<meta name="description" content="${description}" />`,
        )
        .replace(
          /<link rel="canonical" href="[^"]*"\s*\/>/,
          `<link rel="canonical" href="${canonical}" />`,
        )
        .replace(
          /<meta property="og:title" content="[^"]*"\s*\/>/,
          `<meta property="og:title" content="${title}" />`,
        )
        .replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
          `<meta property="og:description" content="${description}" />`,
        )
        .replace(
          /<meta property="og:url" content="[^"]*"\s*\/>/,
          `<meta property="og:url" content="${canonical}" />`,
        )
        .replace(
          /<meta property="og:image" content="[^"]*"\s*\/>/,
          `<meta property="og:image" content="${ogImage}" />`,
        )
        .replace(
          /<meta name="twitter:title" content="[^"]*"\s*\/>/,
          `<meta name="twitter:title" content="${title}" />`,
        )
        .replace(
          /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
          `<meta name="twitter:description" content="${description}" />`,
        )
        .replace(
          /<meta name="twitter:image" content="[^"]*"\s*\/>/,
          `<meta name="twitter:image" content="${ogImage}" />`,
        )
        .replace(
          /<link rel="apple-touch-icon" href="[^"]*"\s*\/>/,
          `<link rel="apple-touch-icon" href="${APPLE_TOUCH_ICON_PATH}" />
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:locale" content="${OG_LOCALE}" />
    <meta name="twitter:image:alt" content="${title}" />`,
        )
        .replace(
          /<meta property="og:site_name" content="[^"]*"\s*\/>/,
          `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
        );
    },
  };
}
