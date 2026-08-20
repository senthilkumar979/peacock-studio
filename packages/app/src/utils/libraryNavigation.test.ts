import { describe, expect, it } from 'vitest';
import { DASHBOARD_PATH, FLOW_DOCS_PATH } from '@/constants/routes';
import {
  buildLibraryBackState,
  getDashboardBackState,
  getFlowDocsBackState,
  resolveLibraryBackLink,
} from './libraryNavigation';

describe('libraryNavigation', () => {
  it('builds back state helpers', () => {
    expect(buildLibraryBackState('/x', 'X')).toEqual({ from: '/x', fromLabel: 'X' });
    expect(getDashboardBackState()).toEqual({ from: DASHBOARD_PATH, fromLabel: 'Dashboard' });
    expect(getFlowDocsBackState()).toEqual({ from: FLOW_DOCS_PATH, fromLabel: 'Flow Docs' });
  });

  it('resolveLibraryBackLink validates state shape', () => {
    const fallback = getDashboardBackState();
    expect(resolveLibraryBackLink(null)).toEqual(fallback);
    expect(resolveLibraryBackLink({ from: 'relative', fromLabel: 'X' })).toEqual(fallback);
    expect(resolveLibraryBackLink({ from: '/ok', fromLabel: '  ' })).toEqual({
      from: '/ok',
      fromLabel: 'Dashboard',
    });
    expect(resolveLibraryBackLink({ from: '/ok', fromLabel: 'Custom' })).toEqual({
      from: '/ok',
      fromLabel: 'Custom',
    });
  });
});
