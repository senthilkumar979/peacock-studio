import { describe, expect, it } from 'vitest';
import {
  ALL_CAPABILITIES_TRUE,
  DEFAULT_MEMBER_CAPABILITIES,
  parseCapabilities,
} from './organization';

describe('parseCapabilities', () => {
  it('returns role defaults for non-objects', () => {
    expect(parseCapabilities(null, 'admin')).toEqual(ALL_CAPABILITIES_TRUE);
    expect(parseCapabilities('x', 'member')).toEqual(DEFAULT_MEMBER_CAPABILITIES);
  });

  it('merges boolean fields over defaults', () => {
    expect(parseCapabilities({ read: false, delete: true }, 'member')).toEqual({
      ...DEFAULT_MEMBER_CAPABILITIES,
      read: false,
      delete: true,
    });
  });
});
