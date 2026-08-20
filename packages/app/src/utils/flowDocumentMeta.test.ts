import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FLOW_VERSION,
  TitleVersionConflictError,
  isTitleVersionConflictError,
  nextCandidateVersion,
  normalizeFlowStatus,
  normalizeFlowTitle,
  normalizeFlowVersion,
  titleVersionIdentity,
} from './flowDocumentMeta';

describe('flowDocumentMeta', () => {
  it('normalizes status with live default for unknown values', () => {
    expect(normalizeFlowStatus('draft')).toBe('draft');
    expect(normalizeFlowStatus('live')).toBe('live');
    expect(normalizeFlowStatus(undefined)).toBe('live');
    expect(normalizeFlowStatus('weird', 'draft')).toBe('draft');
  });

  it('normalizes version and title', () => {
    expect(normalizeFlowVersion(null)).toBe(DEFAULT_FLOW_VERSION);
    expect(normalizeFlowVersion(' 2.1.0 ')).toBe('2.1.0');
    expect(normalizeFlowTitle(undefined)).toBe('Untitled flow');
    expect(normalizeFlowTitle('  Hello ')).toBe('Hello');
  });

  it('builds case-insensitive title/version identity keys', () => {
    expect(titleVersionIdentity('Hello', '1.0.0')).toEqual({
      title: 'Hello',
      version: '1.0.0',
      titleKey: 'hello',
      versionKey: '1.0.0',
    });
  });

  it('detects TitleVersionConflictError', () => {
    const error = new TitleVersionConflictError({
      conflictDocumentId: 'd1',
      title: 'Guide',
      version: '1.0.0',
    });
    expect(error.name).toBe('TitleVersionConflictError');
    expect(error.message).toContain('Guide');
    expect(isTitleVersionConflictError(error)).toBe(true);
    expect(isTitleVersionConflictError(new Error('x'))).toBe(false);
  });

  it('bumps semver patch or appends -copyN', () => {
    expect(nextCandidateVersion('1.2.3', 0)).toBe('1.2.3');
    expect(nextCandidateVersion('1.2.3-beta', 2)).toBe('1.2.5-beta');
    expect(nextCandidateVersion('v1', 1)).toBe('v1-copy1');
  });
});
