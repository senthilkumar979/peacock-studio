import { DEFAULT_MANUAL_VIEWPORT, MANUAL_STEP_PLACEHOLDER_SCREENSHOT } from '../constants/manualStep';
import type { FlowSection, FlowStep, PageViewEvent } from '../types/events';
import { createFlowStep } from './createFlowStep';
import { createId } from './createFlowStep';

export function createManualFlowStep(): FlowStep {
  const screenshotId = createId();
  const event: PageViewEvent = {
    id: createId(),
    type: 'page-view',
    timestamp: Date.now(),
    url: '',
    title: 'Manual step',
    viewport: DEFAULT_MANUAL_VIEWPORT,
    screenshotId,
  };

  const step = createFlowStep(event, screenshotId);
  step.title = 'New step';
  step.generatedTitle = 'New step';
  step.generatedDescription = 'Describe what the learner should do in this step.';
  return step;
}

export function createFlowSection(title = 'New section', description = ''): FlowSection {
  return {
    id: createId(),
    kind: 'section',
    title,
    description,
  };
}

export { MANUAL_STEP_PLACEHOLDER_SCREENSHOT };
