import type { FlowStep } from '../types/events';

export function getStepUrl(step: FlowStep): string {
  const { event } = step;

  if (event.type === 'navigation') return event.toUrl;
  if (event.type === 'page-view') return event.url;

  return event.url;
}
