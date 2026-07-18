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
