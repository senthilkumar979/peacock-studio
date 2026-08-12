import { describe, expect, it } from 'vitest';
import { ShareNotAllowedError } from '@/services/shareErrors';
import { classifyAppError, shouldSkipErrorReporting } from './appError';

describe('classifyAppError', () => {
  it('classifies JWT / unauthorized as auth (soft)', () => {
    const classified = classifyAppError({ status: 401, message: 'JWT expired' });
    expect(classified.kind).toBe('session');
    expect(classified.isHard).toBe(false);
    expect(classified.title).toMatch(/session/i);
  });

  it('classifies unauthorized without expiry as auth', () => {
    const classified = classifyAppError(new Error('Not authenticated'));
    expect(classified.kind).toBe('auth');
    expect(classified.isHard).toBe(false);
  });

  it('classifies network failures', () => {
    const classified = classifyAppError(new Error('Failed to fetch'));
    expect(classified.kind).toBe('network');
    expect(classified.isHard).toBe(false);
    expect(classified.userMessage).toMatch(/connection/i);
  });

  it('classifies workspace quota / document limit', () => {
    const classified = classifyAppError(new Error('Document limit reached for this workspace'));
    expect(classified.kind).toBe('validation');
    expect(classified.title).toMatch(/limit/i);
    expect(classified.isHard).toBe(false);
  });

  it('marks IndexedDB open failures as hard database errors', () => {
    const error = new Error('IndexedDB open failed: VersionError');
    error.name = 'IndexedDBOpenError';
    const classified = classifyAppError(error);
    expect(classified.kind).toBe('database');
    expect(classified.isHard).toBe(true);
    expect(classified.userMessage).toMatch(/IndexedDB/i);
  });

  it('marks corrupt document payloads as hard', () => {
    const error = new Error('Corrupt or unparseable document payload');
    error.name = 'CorruptDocumentPayloadError';
    const classified = classifyAppError(error);
    expect(classified.kind).toBe('validation');
    expect(classified.isHard).toBe(true);
  });

  it('classifies draft share attempts as validation (no Sentry)', () => {
    const error = new ShareNotAllowedError(
      'Publish this documentation to Live before sharing publicly.',
    );
    const classified = classifyAppError(error);
    expect(classified.kind).toBe('validation');
    expect(classified.isHard).toBe(false);
    expect(shouldSkipErrorReporting(classified, error)).toBe(true);
  });

  it('classifies chunk load failures as network (no Sentry)', () => {
    const error = new Error('Loading chunk 12 failed');
    error.name = 'ChunkLoadError';
    const classified = classifyAppError(error);
    expect(classified.kind).toBe('network');
    expect(shouldSkipErrorReporting(classified, error)).toBe(true);
  });

  it('skips Sentry for routine network failures', () => {
    const classified = classifyAppError(new Error('Failed to fetch'));
    expect(classified.kind).toBe('network');
    expect(shouldSkipErrorReporting(classified)).toBe(true);
  });
});
