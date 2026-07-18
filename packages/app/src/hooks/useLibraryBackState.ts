import { useLocation } from 'react-router-dom';
import { DASHBOARD_PATH, FLOW_DOCS_PATH } from '@/constants/routes';
import {
  getDashboardBackState,
  getFlowDocsBackState,
  resolveLibraryBackLink,
  type LibraryBackState,
} from '@/utils/libraryNavigation';

const COMPARE_PATH = '/compare';

export function useLibraryNavigationState(): LibraryBackState {
  const location = useLocation();

  if (location.pathname === FLOW_DOCS_PATH) return getFlowDocsBackState();
  if (location.pathname === DASHBOARD_PATH) return getDashboardBackState();
  if (location.pathname === COMPARE_PATH) {
    return resolveLibraryBackLink(location.state, getFlowDocsBackState());
  }

  return getDashboardBackState();
}

export function useLibraryBackLink(): LibraryBackState {
  const location = useLocation();
  return resolveLibraryBackLink(location.state);
}
