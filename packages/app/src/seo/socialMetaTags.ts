import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OG_LOCALE,
  ogImageUrl,
  SITE_NAME,
} from '@/constants/site';
import type { RouteMeta } from '@/seo/routeMetaData';

export interface SocialMetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
}

export function resolveOgImage(meta: Pick<RouteMeta, 'ogImage' | 'title'>): string {
  return meta.ogImage ?? ogImageUrl();
}

export function buildSocialMetaTags(meta: RouteMeta): SocialMetaTag[] {
  const image = resolveOgImage(meta);
  const imageAlt = meta.ogImageAlt ?? meta.title;
  const tags: SocialMetaTag[] = [
    { attr: 'name', key: 'description', content: meta.description },
    { attr: 'name', key: 'robots', content: meta.robots },
    { attr: 'property', key: 'og:title', content: meta.title },
    { attr: 'property', key: 'og:description', content: meta.description },
    { attr: 'property', key: 'og:type', content: meta.ogType ?? 'website' },
    { attr: 'property', key: 'og:site_name', content: SITE_NAME },
    { attr: 'property', key: 'og:image', content: image },
    { attr: 'property', key: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
    { attr: 'property', key: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
    { attr: 'property', key: 'og:image:alt', content: imageAlt },
    { attr: 'property', key: 'og:locale', content: OG_LOCALE },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', key: 'twitter:title', content: meta.title },
    { attr: 'name', key: 'twitter:description', content: meta.description },
    { attr: 'name', key: 'twitter:image', content: image },
    { attr: 'name', key: 'twitter:image:alt', content: imageAlt },
  ];

  if (meta.canonical) {
    tags.push({ attr: 'property', key: 'og:url', content: meta.canonical });
  }

  return tags;
}
