import type { FlowEvent, FlowOutlineItem, FlowStep } from '../types/events';
import { getPlayableSteps } from '../types/events';

export function getFlowEventUrl(event: FlowEvent): string {
  if (event.type === 'navigation') return event.toUrl;
  if (event.type === 'page-view') return event.url;
  return event.url;
}

export function getStepUrl(step: FlowStep): string {
  const { event } = step;

  if (event.type === 'navigation') return event.toUrl;
  if (event.type === 'page-view') return event.url;

  return event.url;
}

/** Hostname only (lowercase). Returns null for empty / invalid URLs. */
export function extractHostname(url: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const hostname = new URL(trimmed).hostname.trim().toLowerCase();
    return hostname || null;
  } catch {
    return null;
  }
}

function stepUrlCandidates(step: FlowStep): string[] {
  const { event } = step;
  if (event.type === 'navigation') {
    return [event.fromUrl, event.toUrl];
  }
  return [getStepUrl(step)];
}

/**
 * Distinct domains touched by a step (navigation may contribute from + to).
 * Each step increments each of its domains by 1 in the returned map.
 */
export function countStepDomains(items: FlowOutlineItem[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const step of getPlayableSteps(items)) {
    const domains = new Set<string>();
    for (const url of stepUrlCandidates(step)) {
      const domain = extractHostname(url);
      if (domain) domains.add(domain);
    }
    for (const domain of domains) {
      counts[domain] = (counts[domain] ?? 0) + 1;
    }
  }

  return counts;
}
