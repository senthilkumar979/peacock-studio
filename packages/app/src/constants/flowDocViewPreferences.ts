export type FlowDocDefaultView = 'hub' | 'doc' | 'player';

const STORAGE_KEY = 'peacock-flow-doc-default-view';
const VALID_VIEWS: FlowDocDefaultView[] = ['hub', 'doc', 'player'];

export const FLOW_DOC_DEFAULT_VIEW: FlowDocDefaultView = 'hub';

function isFlowDocDefaultView(value: string): value is FlowDocDefaultView {
  return VALID_VIEWS.includes(value as FlowDocDefaultView);
}

export function readFlowDocDefaultView(): FlowDocDefaultView {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || !isFlowDocDefaultView(raw)) return FLOW_DOC_DEFAULT_VIEW;
    return raw;
  } catch {
    return FLOW_DOC_DEFAULT_VIEW;
  }
}

export function writeFlowDocDefaultView(view: FlowDocDefaultView): void {
  try {
    localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Ignore storage failures in private browsing.
  }
}
