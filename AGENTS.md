# AGENTS.md

## Cursor Cloud specific instructions

For as-implemented system architecture (packages, data flows, cloud modes, sharing, deploy surfaces), see [`architecture.md`](architecture.md).

Peacock is a pnpm workspace monorepo (`packages/*`) for a browser flow recorder + interactive documentation platform. Three packages:

- `@peacock/app` — React 19 + Vite web app (visual editor, player, dashboard, PDF export). Runs fully local; the dev server is the main runnable service.
- `@peacock/extension` — Chrome MV3 extension (records actions, captures screenshots). Build-only; there is no dev server — load `packages/extension/dist` as an unpacked extension in Chrome. Developer guide: [extension.md](extension.md).
- `@peacock/shared` — shared TypeScript types/utils/constants. Only package with automated tests.

Standard commands live in the root and per-package `package.json`. Key ones:

- Run web app (dev): `pnpm dev:app` → http://localhost:5173 . Useful routes: `/` (landing), `/dashboard` (library), `/tours/new` (auto-creates a product tour and opens the builder).
- Tests: `pnpm test` (Vitest, `@peacock/shared` only).
- Lint gate: there is no ESLint/Prettier config or `lint` script despite what `.cursorrules` implies. Use `pnpm -r typecheck` (runs `tsc --noEmit` per package) as the type/lint gate.
- Build all: `pnpm build`. `build:app` also runs `tsc --noEmit` before `vite build`. `build:extension` runs four separate Vite builds (main/content/bridge/capture-tool).

Non-obvious caveats:

- The committed `pnpm-lock.yaml` (lockfileVersion 9.0) is reported by pnpm 10.33.3 as "Ignoring broken lockfile ... not compatible with current pnpm". `pnpm install` still succeeds by resolving fresh from the manifests — this warning is expected and non-fatal. Avoid `--frozen-lockfile`.
- `esbuild`'s postinstall build script is skipped (pnpm "Ignored build scripts" warning), but the prebuilt `@esbuild/linux-x64` package is installed, so Vite/Vitest work without approving it. Do not run the interactive `pnpm approve-builds`.
- The web app runs as a local-first guest by default: data persists to IndexedDB, no login required. Cloud sync (Clerk auth + Supabase) activates when `VITE_CLOUD_SYNC` is truthy AND `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are all set (see `packages/app/src/cloud/config.ts`). Production `.env` should keep `VITE_CLOUD_SYNC=true`. Without keys the app fully works minus cloud sync/sharing. `supabase/migrations/` defines the cloud schema.


## Features in pipeline

When the user asks for "features in pipeline", surface this prioritized product roadmap (agreed with the maintainer). Ordered by launch priority:

1. Launch-blocking: finish + default-on cloud sync & accounts, secure (auth-gated, expirable, revocable) sharing, and team workspaces. The scaffolding already exists in `packages/app/src/cloud/` and `supabase/migrations/` (Clerk, Supabase repositories, `organizations`, `share_links`, `plan limits`) but is flag-gated behind `VITE_CLOUD_SYNC` and not the default.
2. Revenue: team member/role management + billing (Clerk billing or Stripe) with server-enforced plan limits; custom branding / white-label on player, PDF, embeds.
3. Growth & paid differentiation: deeper embed packaging (remove watermark on paid) and per-document view analytics (org-level analytics already ship).
4. Competitive moat: AI-assisted rewrite/summarization (step language is deterministic today in `stepDescriptionLabels.ts`) and semantic/visual compare (compare is index-based today).
5. Enterprise trust & reach: PII detection, retention policies, audit logs; multi-browser extension (Edge/Firefox).

## Phase 2 security cutover (Cloudflare proxy)

Phase 1 bot/abuse controls live in-app (Turnstile + Supabase Edge Functions + DB quotas). After cloud sync is default-on, put Cloudflare in front of the Vercel SPA. **Ops checklist (not code):** DNS orange-cloud to Vercel, SSL Full (strict), Managed WAF + OWASP, Bot Fight Mode, rate limits on `/s/*`. Full steps below.

1. **DNS** — Point `peacockstudio.app` (and www if used) to Cloudflare; orange-cloud proxy to the Vercel hostname. Keep Supabase (`*.supabase.co`) on its own host (do not force the whole API through Cloudflare in this phase).
2. **SSL/TLS** — Full (strict) to Vercel; enable Always Use HTTPS.
3. **WAF** — Enable Cloudflare Managed Ruleset + OWASP Core. Add custom WAF rate rules for `/s/*` (public shares) if Bot Fight alone is insufficient.
4. **Bot Fight Mode** — Enable (Free) or Super Bot Fight (paid). Complements app-level Turnstile on invite send and `resolve-share`.
5. **IP Access Rules / Lists** — Block known abusive ASNs or IPs from dashboard analytics; optional allowlist for admin-only tooling later. Do not allowlist the whole internet.
6. **Edge rate limiting** — Rule on `/s/*` and (if exposed) `/functions/v1/resolve-share` / `/functions/v1/send-org-invite` via the Supabase functions subdomain if you add a custom domain later.
7. **Turnstile** — Keep `VITE_TURNSTILE_SITE_KEY` (Vercel) and `TURNSTILE_SECRET` (Supabase Edge Function secrets). Optionally add a Cloudflare Managed Challenge on suspicious `/s/*` traffic as defense in depth.
8. **CSP** — Existing headers in `vercel.json` already allow `challenges.cloudflare.com`, `va.vercel-scripts.com`, and `vitals.vercel-insights.com` (Vercel Web Analytics + Speed Insights). If Cloudflare adds analytics beacons, extend `connect-src` accordingly.
9. **Secrets checklist** — Vercel: `VITE_TURNSTILE_SITE_KEY`. Vercel env (server-only): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SCREENSHOT_URL_SECRET`. Supabase function secrets: `TURNSTILE_SECRET`, `APP_ORIGIN` (exact SPA origin for CORS), `SCREENSHOT_URL_SECRET`, `RESEND_*` (org invite emails), `CLERK_WEBHOOK_SECRET` (founder welcome on `user.created`), `SMTP_USER` / `SMTP_PASS` (Gmail/Workspace App Password for `hello@peacockstudio.app`; optional `SMTP_HOST` default `smtp.gmail.com`, `SMTP_PORT` default `465`), `SUPER_ADMIN_EMAILS` (comma-separated platform super-admin emails for `/super-admin`), `POSTHOG_PERSONAL_API_KEY` (Query Read key for Acquisition tab; optional `POSTHOG_PROJECT_ID`, `POSTHOG_HOST`). Redeploy Edge Functions after secret changes: `send-org-invite`, `send-welcome-email`, `resolve-share`, `share-preview`, `sign-screenshots`, `platform-admin` and the Vercel app for the new `/storage/images/*` proxy.
10. **Founder welcome email** — Clerk Dashboard → Webhooks → endpoint `https://<project>.supabase.co/functions/v1/send-welcome-email`, subscribe to **user.created** only. Deploy: `supabase functions deploy send-welcome-email --no-verify-jwt`. Sends via Gmail SMTP from `hello@peacockstudio.app` (not Resend). Idempotent via `welcome_email_sends`.
11. **Verify** — Public share load with Turnstile; auth-gated share requires org membership; invite email blocked without admin claim; oversized/non-JPEG-PNG uploads rejected by Storage; new Clerk signup receives founder welcome email.

## Platform super admin

Read-only console at `/super-admin` (tabs: Platform, Health, API — more tabs can be added) for operators listed in the Supabase Edge Function secret `SUPER_ADMIN_EMAILS` (never a `VITE_` var — those ship in the browser bundle).

- Set: `supabase secrets set SUPER_ADMIN_EMAILS=you@company.com`
- Deploy: `supabase functions deploy platform-admin --no-verify-jwt`
- Local: same secret + `supabase functions serve platform-admin`
- Auth: caller Clerk JWT → `resolve_actor_email` → allowlist match → service-role aggregates (orgs, users, doc/tour counts, domains, storage).
- Legacy paths `/platform/admin`, `/health`, and `/api-docs` redirect into the matching Super Admin tab.

## PostHog product analytics (ops)

Client capture lives in `packages/app/src/analytics/` (consent-gated; requires `VITE_POSTHOG_KEY`). EU project: [Peacock Studio](https://eu.posthog.com/project/229575). Dashboards: [Acquisition](https://eu.posthog.com/project/229575/dashboard/851989), [Product Activation](https://eu.posthog.com/project/229575/dashboard/856211). Kill-switch flags (100% rollout, client runtime): `cloud_library`, `public_share`, `org_invites`.

**Project settings checklist (UI — not all settable from MCP):**

1. **Authorized URLs** — Add `https://peacockstudio.app` under Project settings → Authorized URLs so toolbar / live events restrict correctly.
2. **Session replay** — Confirm recording is enabled; app sets `maskAllInputs`, `.ph-mask` (step notes, invite emails), and `.ph-no-capture` (share tokens).
3. **Path cleaning** — Rules for `/docs/<uuid>`, `/docs/<uuid>/edit`, `/tours/<id>`, `/tours/<id>/edit`, `/s/<token>` are applied ([path cleaning](https://eu.posthog.com/project/229575/settings/project#path-cleaning)). Enable “Apply path cleaning” on web analytics / paths insights if not already.
4. **Reverse proxy (ad blockers)** — Point a first-party subdomain (e.g. `e.peacock…`) at `https://eu.i.posthog.com` and set `VITE_POSTHOG_HOST` / `api_host` to that origin. Do this after Cloudflare fronts the SPA if possible.

**Follow-up product bugs surfaced by Error Tracking / paths (not fixed in the analytics pass):**

1. **`personas` RLS** — highest-volume real DB error (~59+); investigate insert/select policies vs Clerk JWT claims.
2. **Extension install friction** — `/install-extension` is the top page; improve detect-already-installed + CTA → `extension_detected` conversion.
3. **Generic “Something went wrong”** — map to underlying cause; prefer specific UI copy + `error_code` props.
4. **Turnstile reset** — empty-container reset on pricing/share; guard reset calls.
5. **Rage clicks** — review [replays](https://eu.posthog.com/project/229575/replay) filtered by `$rageclick` after new funnel events ship.
