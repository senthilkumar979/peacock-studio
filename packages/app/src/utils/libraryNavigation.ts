import { DASHBOARD_PATH, FLOW_DOCS_PATH } from '@/constants/routes';

export interface LibraryBackState {
  from: string;
  fromLabel: string;
}

export function buildLibraryBackState(from: string, fromLabel: string): LibraryBackState {
  return { from, fromLabel };
}

export function getDashboardBackState(): LibraryBackState {
  return buildLibraryBackState(DASHBOARD_PATH, 'Dashboard');
}

export function getFlowDocsBackState(): LibraryBackState {
  return buildLibraryBackState(FLOW_DOCS_PATH, 'Flow Docs');
}

export function resolveLibraryBackLink(
  state: unknown,
  fallback: LibraryBackState = getDashboardBackState(),
): LibraryBackState {
  if (!state || typeof state !== 'object') return fallback;

  const candidate = state as Partial<LibraryBackState>;
  if (typeof candidate.from !== 'string' || !candidate.from.startsWith('/')) return fallback;

  return {
    from: candidate.from,
    fromLabel:
      typeof candidate.fromLabel === 'string' && candidate.fromLabel.trim()
        ? candidate.fromLabel
        : fallback.fromLabel,
  };
}
