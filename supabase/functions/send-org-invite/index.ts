// Supabase Edge Function: send organization invite emails via Resend.
// Deploy with verify_jwt=false — Clerk third-party JWTs fail the legacy gateway check.
// Auth is validated inside by calling an authenticated RPC with the caller's Bearer token.
// Secrets: RESEND_API_KEY, APP_ORIGIN (e.g. https://app.example.com), RESEND_FROM
//
// Resend note: onboarding@resend.dev can only send to your Resend account email.
// For teammate invites, verify a domain and set RESEND_FROM to that domain.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteBody {
  toEmail?: string;
  organizationName?: string;
  inviterName?: string;
  inviteToken?: string;
  expiresAt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: 'Server misconfigured' }, 500);
    }

    // Prove the caller has a valid cloud session (Clerk JWT accepted by PostgREST).
    const authProbe = await fetch(`${supabaseUrl}/rest/v1/rpc/list_my_memberships`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!authProbe.ok) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = (await req.json()) as InviteBody;
    const toEmail = body.toEmail?.trim().toLowerCase();
    const organizationName = body.organizationName?.trim();
    const inviterName = body.inviterName?.trim() || 'A teammate';
    const inviteToken = body.inviteToken?.trim();
    const expiresAt = body.expiresAt;

    if (!toEmail || !organizationName || !inviteToken) {
      return json({ error: 'Missing fields' }, 400);
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
      return json({ error: 'Invite email is not configured', skipped: true }, 503);
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
      );
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500);
  }
});

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
