// Supabase Edge Function: send organization invite emails via Resend.
// Deploy with verify_jwt=false — Clerk third-party JWTs fail the legacy gateway check.
// Auth is validated inside by calling an authenticated RPC with the caller's Bearer token.
// Secrets: RESEND_API_KEY, APP_ORIGIN (e.g. https://app.example.com), RESEND_FROM

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as InviteBody;
    const toEmail = body.toEmail?.trim().toLowerCase();
    const organizationName = body.organizationName?.trim();
    const inviterName = body.inviterName?.trim() || 'A teammate';
    const inviteToken = body.inviteToken?.trim();
    const expiresAt = body.expiresAt;

    if (!toEmail || !organizationName || !inviteToken) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appOrigin = (Deno.env.get('APP_ORIGIN') ?? 'http://localhost:5173').replace(/\/$/, '');
    const inviteUrl = `${appOrigin}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
    const expiryLabel = expiresAt
      ? new Date(expiresAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'in 7 days';

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — invite email skipped');
      return new Response(
        JSON.stringify({ error: 'Invite email is not configured', skipped: true }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const from = Deno.env.get('RESEND_FROM') ?? 'Peacock Studio <onboarding@resend.dev>';
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
      console.error('Resend error', text);
      return new Response(JSON.stringify({ error: 'Email send failed', detail: text }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
