import type { HealthCheckMethod } from '@/types/health';

/**
 * Admin-facing documentation for each health probe.
 * Shown only when a Health Checker row is expanded.
 */
export const HEALTH_CHECK_METHODS: Record<string, HealthCheckMethod> = {
  'page-dashboard': {
    what: 'Confirms the Dashboard library shell route is wired in the app router.',
    how: 'Static check against the DASHBOARD_PATH constant (`/dashboard`) registered under LibraryLayout. No network call.',
    interpret:
      'Pass means the route constant exists. It does not load dashboard stats or prove the page rendered in the browser.',
  },
  'page-tours': {
    what: 'Confirms the Product Tours library route is registered.',
    how: 'Static check against PRODUCT_TOURS_PATH (`/product-tours`). No network call.',
    interpret: 'Pass = route is in the shell. Open the page link to verify UI manually.',
  },
  'page-flow-docs': {
    what: 'Confirms the Flow Docs library route is registered.',
    how: 'Static check against FLOW_DOCS_PATH (`/flow-docs`). No network call.',
    interpret: 'Pass = route is in the shell. Data load is covered by “Library data load”.',
  },
  'page-test-cases': {
    what: 'Confirms the Test Cases library route is registered.',
    how: 'Static check against TEST_CASES_PATH (`/test-cases`). No network call.',
    interpret: 'Pass = route is in the shell.',
  },
  'page-playwright': {
    what: 'Confirms the Playwright tests library route is registered.',
    how: 'Static check against PLAYWRIGHT_TESTS_PATH (`/playwright-tests`). No network call.',
    interpret: 'Pass = route is in the shell.',
  },
  'page-flow-maps': {
    what: 'Confirms the Flow maps library route is registered.',
    how: 'Static check against FLOW_MAPS_PATH (`/flow-maps`). No network call.',
    interpret: 'Pass = route is in the shell.',
  },
  'page-library-data': {
    what: 'Verifies the active session can list library content (flows + product tours).',
    how: 'Calls listFlowSummaries() and listProductTourSummaries() via libraryRouter. Those hit IndexedDB when local/guest, or authenticated Supabase repositories when the cloud library is active.',
    interpret:
      'Pass = lists succeeded (counts may be zero). Fail = storage/API threw — see the detail message for the underlying error.',
  },
  'cloud-config': {
    what: 'Validates whether cloud sync is intended and whether publishable env vars are present and well-formed.',
    how: 'Reads Vite env at build time: VITE_CLOUD_SYNC, VITE_CLERK_PUBLISHABLE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY. Runs getCloudSyncMissingConfigMessage() and getCloudEnvValidationError() (key prefixes, URL shape, no secret keys).',
    interpret:
      'Skip = cloud flag off (expected local mode). Fail = flag on but missing/invalid keys. Pass = flag on and keys look valid — does not prove Clerk/Supabase are reachable.',
  },
  session: {
    what: 'Reports the current client session mode FSM used to route local vs cloud library.',
    how: 'Reads getSessionModeSnapshot(): local | loading | guest | connecting | onboarding | cloud. Cloud mode also checks isCloudLibraryActive() (org auth context ready).',
    interpret:
      'Pass for local/guest/cloud with active library. Warn for loading, connecting, onboarding, or cloud without an org library. Not an auth login probe by itself.',
  },
  indexeddb: {
    what: 'Proves the browser can open the local Dexie/idb library database.',
    how: 'Opens peacock-flow-library (versioned schema) and lists local flow summaries via listFlowSummaries in flowLibraryDb — always the local store, even when cloud is active.',
    interpret:
      'Pass = DB open + list succeeded. Fail = IndexedDB blocked, corrupted, or upgrade error. Local counts can differ from cloud library counts.',
  },
  extension: {
    what: 'Detects whether the Peacock Chrome extension bridge is reachable on this origin.',
    how: 'probeExtensionInstalled(): (1) DOM marker data-peacock-extension=installed, (2) window.postMessage ping (EXTENSION_PING / HANDOFF), (3) chrome.runtime.sendMessage fallback with configured extension id. ~2s timeout.',
    interpret:
      'Pass = bridge answered. Warn = not detected (missing install, wrong profile, or content script not injected on this host). Does not validate recording quality.',
  },
  supabase: {
    what: 'Live authenticated read against Supabase for the active organization.',
    how: 'Only when cloud sync is enabled, session is cloud, and library is active. Uses getAuthenticatedSupabaseClient() (Clerk JWT as access token) and selects organizations.id for the current org id (limit 1).',
    interpret:
      'Skip when not in cloud library. Pass = query returned without error. Fail = RLS/JWT/third-party auth/migration issues — message usually includes PostgREST code.',
  },
  sentry: {
    what: 'Checks whether Sentry error tracking is configured and initialized in this build.',
    how: 'Reads VITE_SENTRY_DSN via isSentryConfigured() and isSentryInitialized() after DeferredSentry init. No test event is sent.',
    interpret:
      'Skip = no DSN. Warn = DSN present but init not finished yet. Pass = DSN + init. Does not prove events reach Sentry.',
  },
  posthog: {
    what: 'Checks whether PostHog product analytics is configured in this build.',
    how: 'Reads VITE_POSTHOG_KEY via isPostHogConfigured(). Does not send events; actual capture still depends on cookie consent.',
    interpret:
      'Skip = key unset. Pass = key present. Consent off still means no events in the browser.',
  },
  'log-console': {
    what: 'Documents that Health Checker itself is the client diagnostic surface.',
    how: 'Always passes. Reminds admins to expand rows for method detail and use Copy report for a text snapshot (status + detail per check).',
    interpret: 'Informational only — not a probe of browser console or server logs.',
  },
  'log-cloud-init': {
    what: 'Surfaces the last cloud library initialization error held in auth context, if any.',
    how: 'Reads useCloudInitError / getCloudInitErrorSnapshot set when cloud auth or library bootstrap fails (classified via getCloudInitErrorMessage for JWT/RLS/migration cases).',
    interpret:
      'Pass = no recorded init error. Fail = bootstrap previously failed; fix Clerk↔Supabase third-party auth or apply migrations, then re-sign-in / re-run checks.',
  },
};

export function getHealthCheckMethod(checkId: string): HealthCheckMethod | null {
  return HEALTH_CHECK_METHODS[checkId] ?? null;
}
