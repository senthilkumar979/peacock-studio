import type { ElementSnapshot, FlowEvent } from '../types/events';
import { formatVisibleLabel, humanizeIdentifier, sentenceCase } from './humanize';

export interface StepLabels {
  /** Visible name of the control, option, or link. */
  target: string;
  /** Associated field label for inputs and selects. */
  field: string | null;
  /** Recorded or selected value, when available. */
  value: string | null;
  /** Trimmed document title from the event. */
  pageTitle: string | null;
  /** Optional contextual hint from data attributes (e.g. country). */
  contextHint: string | null;
}

type ControlKind =
  | 'button'
  | 'link'
  | 'text-input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'generic';

function cleanLabel(value: string | null | undefined): string {
  if (!value) return '';
  return formatVisibleLabel(value);
}

function humanizeFallback(value: string | null | undefined): string {
  if (!value) return '';
  return sentenceCase(humanizeIdentifier(value));
}

function findDataAttribute(snapshot: ElementSnapshot, key: string): string | undefined {
  const lowerKey = key.toLowerCase();

  for (const source of [snapshot, snapshot.parent, snapshot.grandparent]) {
    if (!source || !('dataAttributes' in source)) continue;
    const match = Object.entries(source.dataAttributes).find(
      ([attrKey]) => attrKey.toLowerCase() === lowerKey,
    );
    if (match) return match[1];
  }

  return undefined;
}

/**
 * Ordered data-attribute keys that carry meaningful step context. The first
 * match wins so the most specific hint (e.g. country) surfaces in the copy.
 */
const CONTEXT_DATA_KEYS = ['country', 'region', 'state', 'category', 'section', 'tab', 'step'];

function resolveContextHint(snapshot: ElementSnapshot): string | null {
  for (const key of CONTEXT_DATA_KEYS) {
    const value = findDataAttribute(snapshot, key);
    if (value) {
      const cleaned = cleanLabel(value) || value;
      return `${sentenceCase(key)}: ${cleaned}`;
    }
  }

  return null;
}

function resolveFieldLabel(snapshot: ElementSnapshot): string {
  const candidates = [
    snapshot.label.text,
    snapshot.label.ariaLabel,
    snapshot.label.ariaLabelledBy,
    snapshot.label.placeholder,
    snapshot.name,
    snapshot.id,
  ];

  for (const candidate of candidates) {
    const cleaned = cleanLabel(candidate) || humanizeFallback(candidate);
    if (cleaned) return cleaned;
  }

  return 'field';
}

function resolveTargetLabel(snapshot: ElementSnapshot): string {
  const candidates = [
    snapshot.innerText,
    snapshot.label.text,
    snapshot.label.ariaLabel,
    snapshot.label.ariaLabelledBy,
    snapshot.label.placeholder,
    snapshot.ariaDescription,
    snapshot.name,
    snapshot.id,
  ];

  for (const candidate of candidates) {
    const cleaned = cleanLabel(candidate) || humanizeFallback(candidate);
    if (cleaned) return cleaned;
  }

  return sentenceCase(snapshot.role ?? snapshot.tagName);
}

function resolveOptionLabel(snapshot: ElementSnapshot, event: FlowEvent): string {
  const labelCandidates = [
    snapshot.label.text,
    snapshot.parent?.text,
    snapshot.label.ariaLabel,
    snapshot.label.ariaLabelledBy,
  ];

  for (const candidate of labelCandidates) {
    const cleaned = cleanLabel(candidate);
    if (cleaned) return cleaned;
  }

  const value = getRecordedValue(snapshot, event);
  if (value) return value;

  return humanizeFallback(snapshot.name) || humanizeFallback(snapshot.id) || 'option';
}

function getRecordedValue(snapshot: ElementSnapshot, event: FlowEvent): string | null {
  if (event.type === 'input' && event.valuePreview) {
    return cleanLabel(event.valuePreview) || event.valuePreview;
  }

  const preview = snapshot.valuePreview ? cleanLabel(snapshot.valuePreview) : '';
  return preview || null;
}

function getPageTitle(event: FlowEvent): string | null {
  if (event.type === 'navigation' || event.type === 'page-view') return null;
  const title = cleanLabel(event.title);
  return title || null;
}

export function getControlKind(snapshot: ElementSnapshot): ControlKind {
  if (snapshot.isButton) return 'button';
  if (snapshot.isLink) return 'link';
  if (snapshot.isSelect) return 'select';
  if (snapshot.isCheckbox) return 'checkbox';
  if (snapshot.isRadio) return 'radio';
  if (snapshot.tagName === 'textarea') return 'textarea';
  if (snapshot.isInput) return 'text-input';
  return 'generic';
}

export function isSubmitButton(snapshot: ElementSnapshot): boolean {
  return snapshot.tagName === 'button'
    ? snapshot.type === 'submit'
    : snapshot.type === 'submit';
}

export function isInsideForm(snapshot: ElementSnapshot): boolean {
  return (
    snapshot.parent?.tagName === 'form' ||
    snapshot.grandparent?.tagName === 'form' ||
    Boolean(snapshot.parent?.name || snapshot.grandparent?.name)
  );
}

export function resolveStepLabels(snapshot: ElementSnapshot, event: FlowEvent): StepLabels {
  const kind = getControlKind(snapshot);
  const value = getRecordedValue(snapshot, event);

  return {
    target:
      kind === 'checkbox' || kind === 'radio'
        ? resolveOptionLabel(snapshot, event)
        : resolveTargetLabel(snapshot),
    field: kind === 'text-input' || kind === 'textarea' || kind === 'select'
      ? resolveFieldLabel(snapshot)
      : null,
    value,
    pageTitle: getPageTitle(event),
    contextHint: resolveContextHint(snapshot),
  };
}

export function formatPagePrefix(pageTitle: string | null): string {
  if (!pageTitle) return '';
  return `On the ${pageTitle} page, `;
}

export function formatContextSuffix(contextHint: string | null): string {
  if (!contextHint) return '';
  return ` (${contextHint})`;
}
