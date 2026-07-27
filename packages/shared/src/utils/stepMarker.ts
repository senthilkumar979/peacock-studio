import type { FlowStep, NormalizedPosition, Viewport } from '../types/events';

export function getStepViewport(step: FlowStep): Viewport | null {
  if (step.event.type === 'click' || step.event.type === 'page-view' || step.event.type === 'submit') {
    return step.event.viewport;
  }

  if (step.event.type === 'input') {
    return step.event.viewport ?? null;
  }

  return null;
}

export function getStepMarkerPosition(step: FlowStep): NormalizedPosition | null {
  if (step.event.type === 'click') {
    return step.event.position;
  }

  if (step.event.type === 'input' || step.event.type === 'submit') {
    return step.event.position ?? null;
  }

  return null;
}
