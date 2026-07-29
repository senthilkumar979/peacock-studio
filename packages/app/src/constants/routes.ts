/** Marketing landing page */
export const LANDING_PATH = '/' as const;

/** App library dashboard */
export const DASHBOARD_PATH = '/dashboard' as const;

/** Library listing pages */
export const FLOW_DOCS_PATH = '/flow-docs' as const;
export const PRODUCT_TOURS_PATH = '/product-tours' as const;

/** Marketing pricing / beta page */
export const PRICING_PATH = '/pricing' as const;

/** Browser extension install gate (redirects to next when installed) */
export const EXTENSION_INSTALL_PATH = '/install-extension' as const;

/** Legal pages */
export const PRIVACY_PATH = '/privacy' as const;
export const TERMS_PATH = '/terms' as const;

/** Generated workflow artifacts */
export const TEST_CASES_PATH = '/test-cases' as const;
export const PLAYWRIGHT_TESTS_PATH = '/playwright-tests' as const;
export const FLOW_MAPS_PATH = '/flow-maps' as const;

/** Multi-tenant workspace onboarding / admin */
export const WORKSPACE_ONBOARDING_PATH = '/onboarding/workspace' as const;
export const ACCEPT_INVITE_PATH = '/accept-invite' as const;
export const ORG_ADMIN_PATH = '/org/admin' as const;
/** Platform super admin console (tabs: platform, health, api, …) */
export const SUPER_ADMIN_PATH = '/super-admin' as const;
/** @deprecated Prefer SUPER_ADMIN_PATH?tab=platform */
export const PLATFORM_ADMIN_PATH = '/platform/admin' as const;
/** @deprecated Prefer SUPER_ADMIN_PATH?tab=health */
export const HEALTH_CHECKER_PATH = '/health' as const;
/** @deprecated Prefer SUPER_ADMIN_PATH?tab=api */
export const API_DOCS_PATH = '/api-docs' as const;
export const ERROR_PATH = '/error' as const;

/** True when the pathname is a public share embed iframe (`/s/:token/embed`). */
export function isEmbedSharePath(pathname: string): boolean {
  return /^\/s\/[^/]+\/embed\/?$/.test(pathname);
}

export function getSuperAdminPath(tab?: 'platform' | 'health' | 'api'): string {
  if (!tab || tab === 'platform') return SUPER_ADMIN_PATH;
  return `${SUPER_ADMIN_PATH}?tab=${tab}`;
}

export function getTestCasesDetailPath(documentId: string): string {
  return `${TEST_CASES_PATH}/${documentId}`;
}

export function getPlaywrightTestsDetailPath(documentId: string): string {
  return `${PLAYWRIGHT_TESTS_PATH}/${documentId}`;
}

export function getFlowMapsDetailPath(documentId: string): string {
  return `${FLOW_MAPS_PATH}/${documentId}`;
}
