// Supabase Edge Function: founder welcome email on Clerk user.created.
// Deploy with verify_jwt=false — Clerk webhooks use Svix signatures, not JWTs.
// Secrets: CLERK_WEBHOOK_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//          APP_ORIGIN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { Webhook } from 'npm:svix@1.37.0';
import nodemailer from 'npm:nodemailer@6.9.16';

const FROM_ADDRESS = 'Senthil from Peacock Studio <hello@peacockstudio.app>';
const REPLY_TO = 'hello@peacockstudio.app';
const LOGO_URL = 'https://peacockstudio.app/peacock-logo.png';
const SITE_URL = 'https://peacockstudio.app';

interface ClerkEmailAddress {
  id?: string;
  email_address?: string;
}

interface ClerkUserData {
  id?: string;
  first_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
}

interface ClerkWebhookEvent {
  type?: string;
  data?: ClerkUserData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET')?.trim();
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not set');
      return json({ error: 'Server misconfigured' }, 500);
    }

    const payload = await req.text();
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');
    if (!svixId || !svixTimestamp || !svixSignature) {
      return json({ error: 'Missing Svix headers' }, 400);
    }

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch (error) {
      console.error('Webhook verification failed', error);
      return json({ error: 'Invalid signature' }, 400);
    }

    if (event.type !== 'user.created') {
      return json({ ok: true, ignored: true }, 200);
    }

    const clerkUserId = event.data?.id?.trim();
    const toEmail = resolvePrimaryEmail(event.data);
    if (!clerkUserId || !toEmail) {
      console.warn('user.created missing id or email', { clerkUserId, toEmail });
      return json({ ok: true, skipped: true, reason: 'missing_email' }, 200);
    }

    const firstName = event.data?.first_name?.trim() || null;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Server misconfigured' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: insertError } = await admin.from('welcome_email_sends').insert({
      clerk_user_id: clerkUserId,
      to_email: toEmail,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return json({ ok: true, already_sent: true }, 200);
      }
      console.error('welcome_email_sends insert failed', insertError);
      return json({ error: 'Could not claim welcome send' }, 500);
    }

    try {
      await sendWelcomeEmail({ toEmail, firstName });
    } catch (sendError) {
      console.error('Welcome email SMTP send failed', sendError);
      await admin.from('welcome_email_sends').delete().eq('clerk_user_id', clerkUserId);
      return json({ error: 'Email send failed' }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error(error);
    return json({ error: 'Internal error' }, 500);
  }
});

function resolvePrimaryEmail(data: ClerkUserData | undefined): string | null {
  if (!data) return null;
  const addresses = data.email_addresses ?? [];
  const primaryId = data.primary_email_address_id;
  const primary = primaryId
    ? addresses.find((entry) => entry.id === primaryId)
    : addresses[0];
  const email = primary?.email_address?.trim().toLowerCase();
  return email || null;
}

async function sendWelcomeEmail(input: {
  toEmail: string;
  firstName: string | null;
}): Promise<void> {
  const smtpUser = Deno.env.get('SMTP_USER')?.trim();
  const smtpPass = Deno.env.get('SMTP_PASS')?.trim();
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP_USER / SMTP_PASS not configured');
  }

  const host = (Deno.env.get('SMTP_HOST') ?? 'smtp.gmail.com').trim();
  const port = Number((Deno.env.get('SMTP_PORT') ?? '465').trim()) || 465;
  const appOrigin = (Deno.env.get('APP_ORIGIN') ?? SITE_URL)
    .split(',')[0]
    ?.trim()
    .replace(/\/$/, '') || SITE_URL;
  const dashboardUrl = `${appOrigin}/dashboard`;

  const greeting = input.firstName ? `Hi ${input.firstName},` : 'Hi there,';
  const { html, text } = buildWelcomeContent({ greeting, dashboardUrl });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: input.toEmail,
    subject: 'Welcome to Peacock Studio',
    text,
    html,
  });
}

function buildWelcomeContent(input: {
  greeting: string;
  dashboardUrl: string;
}): { html: string; text: string } {
  const greeting = escapeHtml(input.greeting);
  const dashboardUrl = escapeHtml(input.dashboardUrl);
  const logoUrl = escapeHtml(LOGO_URL);
  const siteUrl = escapeHtml(SITE_URL);
  const replyTo = escapeHtml(REPLY_TO);

  const text = [
    input.greeting,
    '',
    'Thanks for signing up for Peacock Studio — I am glad you are here.',
    '',
    'Peacock turns real browser flows into polished guides and product tours, so your team can document once and share something people actually follow.',
    '',
    'I will read each and every mail. Please share your feedback directly to me.',
    '',
    `Open your library: ${input.dashboardUrl}`,
    '',
    '— Senthil',
    'Founder, Peacock Studio',
    REPLY_TO,
    SITE_URL,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Peacock Studio</title>
</head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ccfbf1;box-shadow:0 8px 24px rgba(13,148,136,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="Peacock Studio" width="56" height="56" style="display:inline-block;border-radius:12px;background:#ffffff;padding:6px;" />
              <p style="margin:14px 0 0;font-size:18px;font-weight:700;letter-spacing:0.02em;color:#ffffff;">Peacock Studio</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Thanks for signing up for Peacock Studio — I am glad you are here.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Peacock turns real browser flows into polished guides and product tours, so your team can document once and share something people actually follow.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;font-weight:600;color:#0f766e;">
                I will read each and every mail. Please share your feedback directly to me.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:10px;background:#0d9488;">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Open your library
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 4px;font-size:16px;line-height:1.6;">— Senthil</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#64748b;">Founder, Peacock Studio</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
                Reply anytime to <a href="mailto:${replyTo}" style="color:#0d9488;text-decoration:none;">${replyTo}</a>
                · <a href="${siteUrl}" style="color:#0d9488;text-decoration:none;">peacockstudio.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
