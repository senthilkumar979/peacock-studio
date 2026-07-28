#!/usr/bin/env node
/**
 * Zips packages/extension/dist contents for Chromium store upload.
 * Does not alter the Vite build — same artifact for Chrome Web Store and Edge Add-ons.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(root, '..');
const distManifest = join(packageRoot, 'dist', 'manifest.json');
if (!existsSync(distManifest)) {
  console.error('Run pnpm build first — dist/manifest.json missing');
  process.exit(1);
}

const version = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).version;
const outName = `peacock-extension-v${version}.zip`;
const outPath = join(packageRoot, outName);
if (existsSync(outPath)) unlinkSync(outPath);

execFileSync('zip', ['-r', outPath, '.'], {
  cwd: join(packageRoot, 'dist'),
  stdio: 'inherit',
});
console.log(`Wrote ${outName} (same artifact for Chrome Web Store and Edge Add-ons)`);
