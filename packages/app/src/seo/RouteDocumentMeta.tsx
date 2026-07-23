import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import { ogImageUrl, SITE_NAME } from '@/constants/site';
import {
  applyMetaTags,
  removeJsonLd,
  setDocumentTitle,
  upsertJsonLd,
  upsertLink,
} from '@/seo/applyHeadMeta';
import { resolveRouteMeta } from '@/seo/resolveRouteMeta';

const LANDING_JSON_LD_ID = 'peacock-landing-jsonld';

/**
 * Per-route document title, description, robots, canonical, and OG/Twitter tags.
 * Mount once under the router. Landing JSON-LD is attached only on `/`.
 */
export const RouteDocumentMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveRouteMeta(pathname);
    setDocumentTitle(meta.title);

    applyMetaTags([
      { attr: 'name', key: 'description', content: meta.description },
      { attr: 'name', key: 'robots', content: meta.robots },
      { attr: 'property', key: 'og:title', content: meta.title },
      { attr: 'property', key: 'og:description', content: meta.description },
      { attr: 'property', key: 'og:type', content: 'website' },
      { attr: 'property', key: 'og:site_name', content: SITE_NAME },
      { attr: 'property', key: 'og:image', content: ogImageUrl() },
      { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { attr: 'name', key: 'twitter:title', content: meta.title },
      { attr: 'name', key: 'twitter:description', content: meta.description },
      { attr: 'name', key: 'twitter:image', content: ogImageUrl() },
    ]);

    if (meta.canonical) {
      upsertLink('canonical', meta.canonical);
      applyMetaTags([{ attr: 'property', key: 'og:url', content: meta.canonical }]);
    }

    if (meta.jsonLd) {
      upsertJsonLd(LANDING_JSON_LD_ID, meta.jsonLd);
    } else {
      removeJsonLd(LANDING_JSON_LD_ID);
    }

    return () => {
      setDocumentTitle(PEACOCK_APP_NAME);
    };
  }, [pathname]);

  return null;
};
