import { describe, expect, it } from 'vitest';
import { fetchClerkSupabaseAccessToken } from './clerkSupabaseToken';

describe('clerkSupabaseToken', () => {
  it('throws when session token missing', async () => {
    await expect(fetchClerkSupabaseAccessToken(async () => null)).rejects.toThrow(
      /session is not ready/,
    );
  });

  it('throws when token is not a JWT', async () => {
    await expect(fetchClerkSupabaseAccessToken(async () => 'not-a-jwt')).rejects.toThrow(
      /invalid session token/,
    );
  });

  it('returns a well-formed JWT', async () => {
    const token = 'aaa.bbb.ccc';
    await expect(fetchClerkSupabaseAccessToken(async () => token)).resolves.toBe(token);
  });
});
