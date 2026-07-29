/** Canonical Cloudflare Turnstile server-side verification for Edge Functions. */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResult {
  success?: boolean;
  'error-codes'?: string[];
}

/** Reads TURNSTILE_SECRET, falling back to legacy TURNSTILE_SECRET_KEY. */
export function getTurnstileSecret(): string | undefined {
  return (
    Deno.env.get('TURNSTILE_SECRET')?.trim() ||
    Deno.env.get('TURNSTILE_SECRET_KEY')?.trim() ||
    undefined
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSecret());
}

/**
 * Verifies a Turnstile token via canonical siteverify.
 * Returns true when verification succeeds; false on failure or dev-bypass tokens.
 * When no secret is configured, returns true (local/dev skip).
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = getTurnstileSecret();
  if (!secret) {
    console.warn('TURNSTILE_SECRET not set — skipping verification');
    return true;
  }

  if (token.startsWith('dev-bypass:')) {
    return false;
  }

  let result: SiteverifyResult;
  try {
    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);
    if (ip && ip !== 'unknown') form.set('remoteip', ip);

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });

    if (!response.ok) {
      console.error('Turnstile siteverify HTTP error', response.status);
      return false;
    }

    result = (await response.json()) as SiteverifyResult;
  } catch (error) {
    console.error('Turnstile siteverify network error', error);
    return false;
  }

  if (!result.success) {
    const codes = result['error-codes']?.join(', ') ?? 'unknown';
    console.warn('Turnstile siteverify rejected token', codes);
    return false;
  }

  return true;
}
