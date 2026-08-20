import { describe, expect, it } from 'vitest';
import {
  classifyCloudInitError,
  getCloudInitErrorMessage,
  getCloudNetworkBlockedError,
  isCloudHostedScreenshotUrl,
  isCloudNetworkBlockedError,
} from './cloudInitErrors';

describe('cloudInitErrors', () => {
  it('maps network / fetch failures to network_blocked with workarounds', () => {
    const failedFetch = classifyCloudInitError(new TypeError('Failed to fetch'));
    expect(failedFetch.kind).toBe('network_blocked');
    expect(failedFetch.title).toMatch(/organization network is blocking/i);
    expect(failedFetch.message).toMatch(/Clerk for authentication/i);
    expect(failedFetch.message).toMatch(/Supabase for screenshots/i);
    expect(failedFetch.workarounds.length).toBeGreaterThan(0);
    expect(failedFetch.workarounds.join(' ')).toMatch(/clerk\.peacockstudio\.app/);

    expect(isCloudNetworkBlockedError(new Error('NetworkError when attempting to fetch resource.'))).toBe(
      true,
    );
    expect(classifyCloudInitError({ status: 502, message: 'bad gateway' }).kind).toBe('network_blocked');
    expect(classifyCloudInitError({ status: 403, message: 'Forbidden' }).kind).toBe('network_blocked');
  });

  it('exposes shared corporate-network blocked copy', () => {
    const error = getCloudNetworkBlockedError();
    expect(error).toEqual(classifyCloudInitError(new TypeError('Failed to fetch')));
    expect(error.workarounds.some((item) => /Contact Peacock support/i.test(item))).toBe(true);
  });

  it('detects cloud-hosted screenshot URLs', () => {
    expect(isCloudHostedScreenshotUrl('/storage/images/a/b/c.png?token=1')).toBe(true);
    expect(
      isCloudHostedScreenshotUrl('https://peacockstudio.app/storage/images/a/b/c.png?token=1'),
    ).toBe(true);
    expect(
      isCloudHostedScreenshotUrl('https://xyz.supabase.co/storage/v1/object/sign/screenshots/x'),
    ).toBe(true);
    expect(isCloudHostedScreenshotUrl('data:image/png;base64,abc')).toBe(false);
    expect(isCloudHostedScreenshotUrl('blob:https://peacockstudio.app/1')).toBe(false);
  });

  it('maps atob / InvalidCharacterError decode failures', () => {
    expect(
      classifyCloudInitError({ name: 'InvalidCharacterError', message: 'bad' }).kind,
    ).toBe('auth');
    expect(classifyCloudInitError({ name: 'InvalidCharacterError', message: 'bad' }).message).toMatch(
      /Could not decode/,
    );
    expect(classifyCloudInitError(new Error('Failed to execute atob')).message).toMatch(/Could not decode/);
  });

  it('maps JWT / 401 auth failures', () => {
    expect(classifyCloudInitError({ code: 'PGRST301', message: 'x' }).message).toMatch(
      /rejected the Clerk session/,
    );
    expect(classifyCloudInitError({ status: 401, message: 'x' }).kind).toBe('auth');
    expect(classifyCloudInitError({ message: 'invalid token' }).message).toMatch(/rejected the Clerk/);
  });

  it('maps missing table and screenshot constraint codes', () => {
    expect(classifyCloudInitError({ code: '42P01' }).kind).toBe('migration');
    expect(classifyCloudInitError({ code: '42P01' }).message).toMatch(/tables are missing/);
    expect(
      classifyCloudInitError({
        code: '23505',
        message: 'duplicate key screenshot_assets_org_hash_uidx',
      }).message,
    ).toMatch(/outdated database constraint/);
  });

  it('falls back to record message or generic copy', () => {
    expect(classifyCloudInitError({ message: 'custom boom' }).message).toBe('custom boom');
    expect(classifyCloudInitError({}).message).toMatch(/Could not connect your cloud library/);
    expect(getCloudInitErrorMessage('plain')).toBe('plain');
    expect(getCloudInitErrorMessage(undefined)).toMatch(/Could not connect your cloud library/);
  });
});
