import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITE_ORIGIN } from '../src/constants/site.ts';
import { listPublicMarketingPaths } from '../src/seo/publicPaths.ts';

function priorityForPath(path: string): { changefreq: string; priority: string } {
  if (path === '/') return { changefreq: 'weekly', priority: '1.0' };
  if (path === '/products' || path === '/solutions') {
    return { changefreq: 'weekly', priority: '0.9' };
  }
  if (path.startsWith('/products/')) return { changefreq: 'monthly', priority: '0.8' };
  if (path.startsWith('/solutions/')) return { changefreq: 'monthly', priority: '0.7' };
  if (path === '/pricing' || path === '/install-extension') {
    return { changefreq: 'monthly', priority: '0.8' };
  }
  return { changefreq: 'yearly', priority: '0.5' };
}

const paths = listPublicMarketingPaths();
const urls = paths
  .map((path) => {
    const loc = path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
    const { changefreq, priority } = priorityForPath(path);
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outputPath = resolve(import.meta.dirname, '../public/sitemap.xml');
writeFileSync(outputPath, xml, 'utf8');
console.log(`Wrote ${paths.length} URLs to ${outputPath}`);
