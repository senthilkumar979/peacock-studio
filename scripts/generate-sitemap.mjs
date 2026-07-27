#!/usr/bin/env node
/**
 * Regenerates packages/app/public/sitemap.xml from the same product/solution
 * slugs the SPA uses. Run: node scripts/generate-sitemap.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'https://peacock.mentorbridge.in';

const PRODUCT_SLUGS = [
  'flow-documents',
  'product-tours',
  'capture-screenshot-editor',
];

const SOLUTION_SLUGS = [
  'developers',
  'testers',
  'product-owners',
  'business-analysts',
  'helpdesk',
  'new-hires',
  'sales',
  'customer-success',
  'executives',
  'security-compliance',
];

/** @type {{ path: string; changefreq: string; priority: string }[]} */
const entries = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  ...PRODUCT_SLUGS.map((slug) => ({
    path: `/products/${slug}`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  { path: '/solutions', changefreq: 'weekly', priority: '0.9' },
  ...SOLUTION_SLUGS.map((slug) => ({
    path: `/solutions/${slug}`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
  { path: '/pricing', changefreq: 'weekly', priority: '0.9' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/install-extension', changefreq: 'monthly', priority: '0.6' },
];

const body = entries
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${ORIGIN}${path === '/' ? '/' : path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const out = join(__dirname, '../packages/app/public/sitemap.xml');
writeFileSync(out, xml, 'utf8');
console.log(`Wrote ${out} (${entries.length} urls)`);
