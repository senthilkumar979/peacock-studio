import type { FlowEvent, FlowStep } from '../types/events';
import { enrichStepFromEvent } from './stepDescription';

export function createId(): string {
  return crypto.randomUUID();
}

export function createFlowStep(event: FlowEvent, screenshotId: string): FlowStep {
  const step: FlowStep = {
    id: createId(),
    event,
    title: '',
    notes: '',
    generatedTitle: '',
    generatedDescription: '',
    screenshotId,
    detailedDescription: '',
  };

  enrichStepFromEvent(step, event);
  return step;
}
