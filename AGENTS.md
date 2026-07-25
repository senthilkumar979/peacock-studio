# AGENTS.md

## Cursor Cloud specific instructions

Peacock is a pnpm workspace monorepo (`packages/*`) for a browser flow recorder + interactive documentation platform. Three packages:

- `@peacock/app` — React 19 + Vite web app (visual editor, player, dashboard, PDF export). Runs fully local; the dev server is the main runnable service.
- `@peacock/extension` — Chrome MV3 extension (records actions, captures screenshots). Build-only; there is no dev server — load `packages/extension/dist` as an unpacked extension in Chrome.
- `@peacock/shared` — shared TypeScript types/utils/constants. Only package with automated tests.

Standard commands live in the root and per-package `package.json`. Key ones:

- Run web app (dev): `pnpm dev:app` → http://localhost:5173 . Useful routes: `/` (landing), `/dashboard` (library), `/tours/new` (auto-creates a product tour and opens the builder).
- Tests: `pnpm test` (Vitest, `@peacock/shared` only).
- Lint gate: there is no ESLint/Prettier config or `lint` script despite what `.cursorrules` implies. Use `pnpm -r typecheck` (runs `tsc --noEmit` per package) as the type/lint gate.
- Build all: `pnpm build`. `build:app` also runs `tsc --noEmit` before `vite build`. `build:extension` runs four separate Vite builds (main/content/bridge/capture-tool).

Non-obvious caveats:

- The committed `pnpm-lock.yaml` (lockfileVersion 9.0) is reported by pnpm 10.33.3 as "Ignoring broken lockfile ... not compatible with current pnpm". `pnpm install` still succeeds by resolving fresh from the manifests — this warning is expected and non-fatal. Avoid `--frozen-lockfile`.
- `esbuild`'s postinstall build script is skipped (pnpm "Ignored build scripts" warning), but the prebuilt `@esbuild/linux-x64` package is installed, so Vite/Vitest work without approving it. Do not run the interactive `pnpm approve-builds`.
- The web app runs as a local-first guest by default: data persists to IndexedDB, no login required. Cloud sync (Clerk auth + Supabase) is optional and only activates when `VITE_CLOUD_SYNC` is truthy AND `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are all set (see `packages/app/src/cloud/config.ts`). Without them the app fully works minus cloud sync/sharing. `supabase/migrations/` defines the cloud schema.

## Features in pipeline

When the user asks for "features in pipeline", surface this prioritized product roadmap (agreed with the maintainer). Ordered by launch priority:

1. Launch-blocking: finish + default-on cloud sync & accounts, secure (auth-gated, expirable, revocable) sharing, and team workspaces. The scaffolding already exists in `packages/app/src/cloud/` and `supabase/migrations/` (Clerk, Supabase repositories, `organizations`, `share_links`, `plan limits`) but is flag-gated behind `VITE_CLOUD_SYNC` and not the default.
2. Revenue: team member/role management + billing (Clerk billing or Stripe) with server-enforced plan limits; custom branding / white-label on player, PDF, embeds.
3. Growth & paid differentiation: embed widget (currently a "coming soon" placeholder in `ShareMethodPicker.tsx`) and view analytics.
4. Competitive moat: AI-assisted rewrite/summarization (step language is deterministic today in `stepDescriptionLabels.ts`) and semantic/visual compare (compare is index-based today).
5. Enterprise trust & reach: PII detection, retention policies, audit logs; multi-browser extension (Edge/Firefox).

## Phase 2 security cutover (Cloudflare proxy)

Phase 1 bot/abuse controls live in-app (Turnstile + Supabase Edge Functions + DB quotas). After cloud sync is default-on, put Cloudflare in front of the Vercel SPA:

1. **DNS** — Point `peacock.mentorbridge.in` (and www if used) to Cloudflare; orange-cloud proxy to the Vercel hostname. Keep Supabase (`*.supabase.co`) on its own host (do not force the whole API through Cloudflare in this phase).
2. **SSL/TLS** — Full (strict) to Vercel; enable Always Use HTTPS.
3. **WAF** — Enable Cloudflare Managed Ruleset + OWASP Core. Add custom WAF rate rules for `/s/*` (public shares) if Bot Fight alone is insufficient.
4. **Bot Fight Mode** — Enable (Free) or Super Bot Fight (paid). Complements app-level Turnstile on invite send and `resolve-share`.
5. **IP Access Rules / Lists** — Block known abusive ASNs or IPs from dashboard analytics; optional allowlist for admin-only tooling later. Do not allowlist the whole internet.
6. **Edge rate limiting** — Rule on `/s/*` and (if exposed) `/functions/v1/resolve-share` / `/functions/v1/send-org-invite` via the Supabase functions subdomain if you add a custom domain later.
7. **Turnstile** — Keep `VITE_TURNSTILE_SITE_KEY` (Vercel) and `TURNSTILE_SECRET_KEY` (Supabase Edge Function secrets). Optionally add a Cloudflare Managed Challenge on suspicious `/s/*` traffic as defense in depth.
8. **CSP** — Existing headers in `vercel.json` already allow `challenges.cloudflare.com`. If Cloudflare adds analytics beacons, extend `connect-src` accordingly.
9. **Secrets checklist** — Vercel: `VITE_TURNSTILE_SITE_KEY`. Supabase function secrets: `TURNSTILE_SECRET_KEY`, `APP_ORIGIN` (exact SPA origin for CORS), `RESEND_*`, `SUPER_ADMIN_EMAILS` (comma-separated platform super-admin emails for `/platform/admin`). Redeploy Edge Functions after secret changes: `send-org-invite`, `resolve-share`, `platform-admin`.
10. **Verify** — Public share load with Turnstile; auth-gated share requires org membership; invite email blocked without admin claim; oversized/non-JPEG-PNG uploads rejected by Storage.

## Platform super admin

Read-only console at `/platform/admin` for operators listed in the Supabase Edge Function secret `SUPER_ADMIN_EMAILS` (never a `VITE_` var — those ship in the browser bundle).

- Set: `supabase secrets set SUPER_ADMIN_EMAILS=you@company.com`
- Deploy: `supabase functions deploy platform-admin --no-verify-jwt`
- Local: same secret + `supabase functions serve platform-admin`
- Auth: caller Clerk JWT → `resolve_actor_email` → allowlist match → service-role aggregates (orgs, users, doc/tour counts, domains, storage).
