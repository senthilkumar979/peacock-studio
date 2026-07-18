/** Marketing landing page */
export const LANDING_PATH = '/' as const;

/** App library dashboard */
export const DASHBOARD_PATH = '/dashboard' as const;

/** Legal pages */
export const PRIVACY_PATH = '/privacy' as const;
export const TERMS_PATH = '/terms' as const;

/** Generated workflow artifacts */
export const TEST_CASES_PATH = '/test-cases' as const;
export const PLAYWRIGHT_TESTS_PATH = '/playwright-tests' as const;
export const FLOW_MAPS_PATH = '/flow-maps' as const;

export function getTestCasesDetailPath(documentId: string): string {
  return `${TEST_CASES_PATH}/${documentId}`;
}

export function getPlaywrightTestsDetailPath(documentId: string): string {
  return `${PLAYWRIGHT_TESTS_PATH}/${documentId}`;
}

export function getFlowMapsDetailPath(documentId: string): string {
  return `${FLOW_MAPS_PATH}/${documentId}`;
}
