import { useEffect } from 'react';
import { PEACOCK_APP_NAME } from '@/constants/branding';

const TITLE = `${PEACOCK_APP_NAME} — Capture workflows, build product tours, share demos`;
const DESCRIPTION =
  'Peacock Studio converts real browser workflows into editable walkthroughs, persona-led product tours, and shareable demos. Local-first. Chrome extension included.';

export const useLandingSeo = () => {
  useEffect(() => {
    document.title = TITLE;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('description', DESCRIPTION);
    setMeta('og:title', TITLE, true);
    setMeta('og:description', DESCRIPTION, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', TITLE);
    setMeta('twitter:description', DESCRIPTION);

    const scriptId = 'peacock-landing-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: PEACOCK_APP_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Chrome',
      description: DESCRIPTION,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });

    return () => {
      document.title = PEACOCK_APP_NAME;
    };
  }, []);
};
