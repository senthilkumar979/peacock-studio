import type { FlowStep } from '../types/events';

export function resolveStepDescription(
  step: Pick<FlowStep, 'notes' | 'generatedDescription' | 'hideDescription'>,
): string {
  if (step.hideDescription) return '';
  const trimmed = step.notes.trim();
  return trimmed || step.generatedDescription;
}
