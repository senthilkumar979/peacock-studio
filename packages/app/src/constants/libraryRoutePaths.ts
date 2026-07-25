import {
  API_DOCS_PATH,
  DASHBOARD_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
  HEALTH_CHECKER_PATH,
  PLAYWRIGHT_TESTS_PATH,
  PRODUCT_TOURS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';

const LIBRARY_SHELL_PREFIXES = [
  DASHBOARD_PATH,
  FLOW_DOCS_PATH,
  PRODUCT_TOURS_PATH,
  TEST_CASES_PATH,
  PLAYWRIGHT_TESTS_PATH,
  FLOW_MAPS_PATH,
  HEALTH_CHECKER_PATH,
  API_DOCS_PATH,
] as const;

export function isLibraryShellRoute(pathname: string): boolean {
  return LIBRARY_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
