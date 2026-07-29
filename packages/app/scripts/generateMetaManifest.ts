import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MetaManifest } from '../src/seo/metaManifest.ts';
import { listPublicMarketingPaths } from '../src/seo/publicPaths.ts';
import { resolveRouteMeta } from '../src/seo/resolveRouteMeta.ts';
import { resolveOgImage } from '../src/seo/socialMetaTags.ts';

function buildManifest(): MetaManifest {
  const manifest: MetaManifest = {};

  for (const path of listPublicMarketingPaths()) {
    const meta = resolveRouteMeta(path);
    manifest[path] = {
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical,
      ogImage: resolveOgImage(meta),
      robots: meta.robots,
    };
  }

  return manifest;
}

const manifest = buildManifest();
const outputPath = resolve(import.meta.dirname, '../public/meta-manifest.json');
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${Object.keys(manifest).length} routes to ${outputPath}`);
