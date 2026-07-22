import type { FlowDocDefaultView } from '@/constants/flowDocViewPreferences';
import type { SharedDocumentViewMode } from '@/utils/shareLink';

export type FlowDocResolvedView = FlowDocDefaultView;

export function resolveExplicitViewFromUrl(
  searchParams: URLSearchParams,
  hash: string,
): FlowDocResolvedView | null {
  const view = searchParams.get('view');
  if (view === 'hub' || view === 'doc' || view === 'player') return view;

  const anchor = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!anchor) return null;

  if (
    anchor === 'flow-details' ||
    anchor.startsWith('step-') ||
    anchor.startsWith('linked-')
  ) {
    return 'doc';
  }

  return null;
}

export function resolveFlowDocView(
  searchParams: URLSearchParams,
  hash: string,
  defaultView: FlowDocDefaultView,
  shareLinkViewMode?: SharedDocumentViewMode | null,
): FlowDocResolvedView {
  const explicit = resolveExplicitViewFromUrl(searchParams, hash);
  if (explicit) return explicit;
  if (shareLinkViewMode) return shareLinkViewMode;
  return defaultView;
}
