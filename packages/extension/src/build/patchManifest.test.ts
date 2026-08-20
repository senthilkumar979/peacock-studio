import { describe, expect, it } from 'vitest';
import { patchManifestFileContents, patchManifestForAppUrl } from './patchManifest';

const baseManifest = {
  content_scripts: [
    {
      matches: ['<all_urls>'],
      exclude_matches: ['http://localhost:5173/*'],
      js: ['content/index.js'],
      run_at: 'document_idle',
    },
    {
      matches: ['http://localhost:5173/*'],
      js: ['bridge/index.js'],
      run_at: 'document_idle',
    },
  ],
  externally_connectable: {
    matches: ['http://localhost:5173/*'],
  },
};

describe('patchManifest', () => {
  it('keeps default local patterns when app url is missing', () => {
    const patched = patchManifestForAppUrl(baseManifest, undefined);
    expect(patched.content_scripts[0]?.exclude_matches).toEqual(
      expect.arrayContaining([
        'http://localhost:5173/*',
        'http://127.0.0.1:5173/*',
      ]),
    );
  });

  it('adds production origin patterns', () => {
    const patched = patchManifestForAppUrl(baseManifest, 'https://peacockstudio.app/editor');
    expect(patched.content_scripts[1]?.matches).toContain('https://peacockstudio.app/*');
    expect(patched.externally_connectable.matches).toContain('https://peacockstudio.app/*');
    expect(patched.content_scripts[0]?.exclude_matches).toContain(
      'https://peacockstudio.app/*',
    );
  });

  it('ignores invalid app urls', () => {
    const patched = patchManifestForAppUrl(baseManifest, ':::');
    expect(patched.externally_connectable.matches).not.toContain(':::/*');
  });

  it('does not duplicate localhost when origin already covered', () => {
    const patched = patchManifestForAppUrl(baseManifest, 'http://localhost:5173/editor');
    const matches = patched.externally_connectable.matches.filter(
      (entry) => entry === 'http://localhost:5173/*',
    );
    expect(matches).toHaveLength(1);
  });

  it('serializes patched manifest json with trailing newline', () => {
    const raw = JSON.stringify(baseManifest);
    const next = patchManifestFileContents(raw, 'https://example.com');
    expect(next.endsWith('\n')).toBe(true);
    expect(JSON.parse(next).externally_connectable.matches).toContain('https://example.com/*');
  });
});
