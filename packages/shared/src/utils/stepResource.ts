import type { FlowOutlineItem } from '../types/events';
import type { StepResource, StepResourceInput } from '../types/stepResource';
import { isFlowStep } from '../types/events';
import { createId } from './createFlowStep';
import { getStepScreenshotId } from './stepScreenshot';

export const STEP_DETAILED_DESCRIPTION_MAX_CHARS = 3000;

export const MAX_FLOW_TAGS = 5;

export const MAX_FLOW_TAG_CHARS = 30;

export const MAX_RESOURCE_LABEL_CHARS = 200;

export function validateResourceUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatResourceLabel(url: string): string {
  try {
    const parsed = new URL(url.trim());
    const path = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
    const suffix = path.length > 40 ? `${path.slice(0, 37)}…` : path;
    return suffix ? `${parsed.hostname}${suffix}` : parsed.hostname;
  } catch {
    return url.trim();
  }
}

export function normalizeResourceLabel(label: string | undefined): string | undefined {
  const trimmed = label?.trim().replace(/\s+/g, ' ') ?? '';
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_RESOURCE_LABEL_CHARS);
}

export function resolveResourceLabel(resource: Pick<StepResource, 'url' | 'label'>): string {
  return resource.label?.trim() || formatResourceLabel(resource.url);
}

export function normalizeStepResource(input: StepResourceInput): StepResource {
  const url = input.url.trim();
  if (!validateResourceUrl(url)) {
    throw new Error('Resource URL must be a valid http or https link.');
  }

  const label = normalizeResourceLabel(input.label);

  return {
    id: input.id ?? createId(),
    documentId: input.documentId,
    stepId: input.stepId,
    url,
    ...(label ? { label } : {}),
    sortOrder: input.sortOrder ?? 0,
    createdAt: input.createdAt ?? Date.now(),
  };
}

export function collectReferencedScreenshotIds(steps: FlowOutlineItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of steps) {
    if (!isFlowStep(item)) continue;
    const primary = getStepScreenshotId(item);
    if (primary) ids.add(primary);
    if (item.customScreenshotId) ids.add(item.customScreenshotId);
  }
  return ids;
}

export function pruneScreenshotUrls(
  screenshotUrls: Record<string, string>,
  steps: FlowOutlineItem[],
): Record<string, string> {
  const keep = collectReferencedScreenshotIds(steps);
  const pruned: Record<string, string> = {};
  for (const [id, url] of Object.entries(screenshotUrls)) {
    if (keep.has(id)) pruned[id] = url;
  }
  return pruned;
}

export function countStepResources(resources: StepResource[]): number {
  return resources.length;
}

export function countStepResourcesByStep(
  resources: StepResource[],
  stepId: string,
): number {
  return resources.filter((resource) => resource.stepId === stepId).length;
}

export function getStepResourcesForStep(
  resources: StepResource[],
  stepId: string,
): StepResource[] {
  return resources
    .filter((resource) => resource.stepId === stepId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);
}

export type FlowTagError = 'empty' | 'invalid-start' | 'too-long' | 'limit';

/** Lowercase kebab-case tag: "updated admin flow" → "updated-admin-flow". */
export function normalizeFlowTag(value: string): string | null {
  const parsed = parseFlowTag(value);
  return 'tag' in parsed ? parsed.tag : null;
}

export function parseFlowTag(value: string): { tag: string } | { error: Exclude<FlowTagError, 'limit'> } {
  if (!value.trim()) return { error: 'empty' };

  const kebab = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!kebab || !/^[a-z]/.test(kebab)) return { error: 'invalid-start' };
  if (kebab.length > MAX_FLOW_TAG_CHARS) return { error: 'too-long' };
  return { tag: kebab };
}

export function normalizeFlowTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const tag of tags) {
    const next = normalizeFlowTag(tag);
    if (!next || seen.has(next)) continue;
    seen.add(next);
    normalized.push(next);
    if (normalized.length >= MAX_FLOW_TAGS) break;
  }
  return normalized;
}
