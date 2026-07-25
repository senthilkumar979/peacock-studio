// Supabase Edge Function: send organization invite emails via Resend.
// Deploy with verify_jwt=false — Clerk third-party JWTs fail the legacy gateway check.
// Auth + ownership verified via claim_org_invite_email_send RPC with the caller's Bearer token.
// Secrets: RESEND_API_KEY, APP_ORIGIN, RESEND_FROM, TURNSTILE_SECRET_KEY,
//          SUPABASE_URL, SUPABASE_ANON_KEY
//
// Resend note: onboarding@resend.dev can only send to your Resend account email.
// For teammate invites, verify a domain and set RESEND_FROM to that domain.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface InviteBody {
  invitationId?: string;
  inviterName?: string;
  turnstileToken?: string;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: 'Server misconfigured' }, 500, cors);
    }

    const body = (await req.json()) as InviteBody;
    const invitationId = body.invitationId?.trim();
    const turnstileToken = body.turnstileToken?.trim();
    const inviterName = body.inviterName?.trim() || 'A teammate';

    if (!invitationId) {
      return json({ error: 'Missing invitationId' }, 400, cors);
    }
    if (!turnstileToken) {
      return json({ error: 'Missing Turnstile token' }, 400, cors);
    }

    const turnstileOk = await verifyTurnstile(turnstileToken, clientIp(req));
    if (!turnstileOk) {
      return json({ error: 'Bot check failed' }, 403, cors);
    }

    const claimRes = await fetch(`${supabaseUrl}/rest/v1/rpc/claim_org_invite_email_send`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_invitation_id: invitationId }),
    });

    if (claimRes.status === 401 || claimRes.status === 403) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    if (!claimRes.ok) {
      const detail = await claimRes.text();
      return json(
        { error: summarizeClaimError(detail) },
        claimRes.status >= 400 && claimRes.status < 500 ? 400 : 502,
        cors,
      );
    }

    const claimed = (await claimRes.json()) as {
      toEmail?: string;
      organizationName?: string;
      inviteToken?: string;
      expiresAt?: string;
    };

    const toEmail = claimed.toEmail?.trim().toLowerCase();
    const organizationName = claimed.organizationName?.trim();
    const inviteToken = claimed.inviteToken?.trim();
    const expiresAt = claimed.expiresAt;

    if (!toEmail || !organizationName || !inviteToken) {
      return json({ error: 'Invite claim incomplete' }, 500, cors);
    }

    const appOrigin = (Deno.env.get('APP_ORIGIN') ?? 'http://localhost:5173').replace(/\/$/, '');
    const inviteUrl = `${appOrigin}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
    const expiryLabel = expiresAt
      ? new Date(expiresAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'in 7 days';

    const resendKey = Deno.env.get('RESEND_API_KEY')?.trim();
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — invite email skipped');
      return json({ error: 'Invite email is not configured', skipped: true }, 503, cors);
    }

    const from = (Deno.env.get('RESEND_FROM') ?? 'Peacock Studio <onboarding@resend.dev>').trim();
    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #0f172a;">
        <h1 style="font-size: 20px;">You're invited to ${escapeHtml(organizationName)}</h1>
        <p>${escapeHtml(inviterName)} invited you to join <strong>${escapeHtml(organizationName)}</strong> on Peacock Studio.</p>
        <p>This invite expires ${escapeHtml(expiryLabel)}.</p>
        <p><a href="${inviteUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;">Accept invitation</a></p>
        <p style="font-size:12px;color:#64748b;">Or open: ${inviteUrl}</p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject: `Join ${organizationName} on Peacock Studio`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const text = await resendRes.text();
      console.error('Resend error', resendRes.status, text);
      return json(
        {
          error: 'Email send failed',
          detail: summarizeResendError(text, from, toEmail),
        },
        502,
        cors,
      );
    }

    return json({ ok: true }, 200, cors);
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500, cors);
  }
});

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = (Deno.env.get('APP_ORIGIN') ?? '').replace(/\/$/, '');
  const allowOrigin = allowed && origin === allowed ? origin : allowed || '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(
  payload: Record<string, unknown>,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')?.trim();
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping verification');
    return true;
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (ip && ip !== 'unknown') form.set('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

function summarizeClaimError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: string; error?: string };
    if (parsed.message) return parsed.message.slice(0, 400);
    if (parsed.error) return parsed.error.slice(0, 400);
  } catch {
    // keep raw
  }
  return raw.slice(0, 400) || 'Could not authorize invite email';
}

function summarizeResendError(raw: string, from: string, toEmail: string): string {
  let message = raw;
  try {
    const parsed = JSON.parse(raw) as { message?: string; name?: string };
    if (parsed.message) message = parsed.message;
  } catch {
    // keep raw text
  }

  const lower = message.toLowerCase();
  if (
    lower.includes('only send testing emails') ||
    lower.includes('verify a domain') ||
    from.includes('onboarding@resend.dev')
  ) {
    return (
      `Resend rejected send to ${toEmail} from ${from}. ` +
      'Verify your domain in Resend and set the RESEND_FROM secret to an address on that domain ' +
      '(onboarding@resend.dev can only email your own Resend account address).'
    );
  }

  if (lower.includes('invalid') && lower.includes('api')) {
    return 'Resend API key is invalid. Check the RESEND_API_KEY secret.';
  }

  return message.slice(0, 400);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
