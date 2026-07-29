import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PEACOCK_APP_NAME } from '@/constants/branding';
import {
  applyMetaTags,
  removeJsonLd,
  setDocumentTitle,
  upsertJsonLd,
  upsertLink,
} from '@/seo/applyHeadMeta';
import { resolveRouteMeta } from '@/seo/resolveRouteMeta';
import { buildSocialMetaTags } from '@/seo/socialMetaTags';

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
    applyMetaTags(buildSocialMetaTags(meta));

    if (meta.canonical) {
      upsertLink('canonical', meta.canonical);
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
