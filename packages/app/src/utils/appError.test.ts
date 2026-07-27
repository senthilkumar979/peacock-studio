import { describe, expect, it } from 'vitest';
import { classifyAppError } from './appError';

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
});
