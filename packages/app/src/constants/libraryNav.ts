import type { LucideIcon } from 'lucide-react';
import {
  ClipboardCheck,
  FileText,
  GitBranch,
  LayoutDashboard,
  Map,
  TerminalSquare,
} from 'lucide-react';
import {
  DASHBOARD_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
  PLAYWRIGHT_TESTS_PATH,
  PRODUCT_TOURS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';

export interface LibraryNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export const LIBRARY_NAV_ITEMS: LibraryNavItem[] = [
  { label: 'Dashboard', path: DASHBOARD_PATH, icon: LayoutDashboard, end: true },
  { label: 'Product Tours', path: PRODUCT_TOURS_PATH, icon: Map },
  { label: 'Flow Docs', path: FLOW_DOCS_PATH, icon: FileText },
  { label: 'Test Cases', path: TEST_CASES_PATH, icon: ClipboardCheck },
  { label: 'Playwright tests', path: PLAYWRIGHT_TESTS_PATH, icon: TerminalSquare },
  { label: 'Flow maps', path: FLOW_MAPS_PATH, icon: GitBranch },
];
