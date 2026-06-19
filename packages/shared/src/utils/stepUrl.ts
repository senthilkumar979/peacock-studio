import type { FlowEvent, FlowStep } from '../types/events';

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
