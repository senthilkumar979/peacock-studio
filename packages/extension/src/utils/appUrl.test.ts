import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAppOrigin,
  getCaptureEditorPageUrl,
  getDashboardPageUrl,
  getEditorPageUrl,
  getNewImageEditorPageUrl,
} from './appUrl';

describe('appUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses default origin when VITE_APP_URL is unset', () => {
    vi.stubEnv('VITE_APP_URL', '');
    expect(getAppOrigin()).toBe('http://localhost:5173');
  });

  it('returns origin from a valid VITE_APP_URL', () => {
    vi.stubEnv('VITE_APP_URL', 'https://peacockstudio.app/editor');
    expect(getAppOrigin()).toBe('https://peacockstudio.app');
  });

  it('falls back when VITE_APP_URL is invalid', async () => {
    vi.stubEnv('VITE_APP_URL', 'not a url');
    vi.resetModules();
    const { getAppOrigin: freshGetAppOrigin } = await import('./appUrl');
    expect(freshGetAppOrigin()).toBe('http://localhost:5173');
  });

  it('builds dashboard url from app origin', () => {
    vi.stubEnv('VITE_APP_URL', 'https://example.com/app');
    expect(getDashboardPageUrl()).toBe('https://example.com/dashboard');
  });

  it('strips trailing slash from editor page url', () => {
    vi.stubEnv('VITE_APP_URL', 'https://example.com/editor/');
    expect(getEditorPageUrl()).toBe('https://example.com/editor');
  });

  it('defaults editor page url when unset', () => {
    vi.unstubAllEnvs();
    expect(getEditorPageUrl()).toBe('http://localhost:5173/editor');
  });

  it('uses localhost defaults when env vars are undefined', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    const { getAppOrigin: freshOrigin, getEditorPageUrl: freshEditor } = await import('./appUrl');
    expect(freshOrigin()).toBe('http://localhost:5173');
    expect(freshEditor()).toBe('http://localhost:5173/editor');
  });

  it('encodes capture id in editor url', () => {
    vi.stubEnv('VITE_APP_URL', 'https://example.com');
    expect(getCaptureEditorPageUrl('abc/123')).toBe(
      'https://example.com/capture/abc%2F123/edit',
    );
  });

  it('builds the session image editor url from app origin', () => {
    vi.stubEnv('VITE_APP_URL', 'https://peacockstudio.app/editor');
    expect(getNewImageEditorPageUrl()).toBe('https://peacockstudio.app/edit/new-image');
  });
});
