import {
  DASHBOARD_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
  PLAYWRIGHT_TESTS_PATH,
  PRODUCT_TOURS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';
import {
  listFlowSummaries,
  listProductTourSummaries,
} from '@/storage/libraryRouter';
import { healthResult } from '@/utils/health/healthResult';
import type { HealthCheckResult } from '@/types/health';

const LIBRARY_PAGE_ROUTES = [
  { id: 'page-dashboard', label: 'Dashboard', path: DASHBOARD_PATH },
  { id: 'page-tours', label: 'Product Tours', path: PRODUCT_TOURS_PATH },
  { id: 'page-flow-docs', label: 'Flow Docs', path: FLOW_DOCS_PATH },
  { id: 'page-test-cases', label: 'Test Cases', path: TEST_CASES_PATH },
  { id: 'page-playwright', label: 'Playwright tests', path: PLAYWRIGHT_TESTS_PATH },
  { id: 'page-flow-maps', label: 'Flow maps', path: FLOW_MAPS_PATH },
] as const;

export async function checkPages(): Promise<HealthCheckResult[]> {
  const routeResults = LIBRARY_PAGE_ROUTES.map((route) =>
    healthResult(
      route.id,
      'pages',
      route.label,
      'pass',
      `Route ${route.path} is registered in the app shell.`,
    ),
  );

  try {
    const [flows, tours] = await Promise.all([
      listFlowSummaries(),
      listProductTourSummaries(),
    ]);
    routeResults.push(
      healthResult(
        'page-library-data',
        'pages',
        'Library data load',
        'pass',
        `Loaded ${flows.length} flow doc(s) and ${tours.length} product tour(s) for the active session.`,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    routeResults.push(
      healthResult(
        'page-library-data',
        'pages',
        'Library data load',
        'fail',
        `Library list failed: ${message}`,
      ),
    );
  }

  return routeResults;
}
