import type { PlayerOutlineSegment } from '@peacock/shared';

export type JourneyNodeKind = 'start' | 'step' | 'step-group' | 'section' | 'branch' | 'finish';

export interface JourneyNode {
  id: string;
  kind: JourneyNodeKind;
  label: string;
  detail?: string;
}

const MAX_VISIBLE_STEPS = 5;

function pushStepGroup(
  nodes: JourneyNode[],
  steps: { stepNumber: number; title: string }[],
): void {
  if (steps.length === 0) return;

  if (steps.length === 1) {
    const step = steps[0];
    if (!step) return;
    nodes.push({
      id: `step-${step.stepNumber}`,
      kind: 'step',
      label: String(step.stepNumber),
      detail: step.title,
    });
    return;
  }

  const first = steps[0];
  const last = steps[steps.length - 1];
  if (!first || !last) return;

  nodes.push({
    id: `steps-${first.stepNumber}-${last.stepNumber}`,
    kind: 'step-group',
    label: `${steps.length} steps`,
    detail:
      first.stepNumber === last.stepNumber
        ? `Step ${first.stepNumber}`
        : `Steps ${first.stepNumber}–${last.stepNumber}`,
  });
}

export function buildFlowJourneyNodes(segments: PlayerOutlineSegment[]): JourneyNode[] {
  const nodes: JourneyNode[] = [{ id: 'start', kind: 'start', label: 'Start' }];
  const stepBuffer: { stepNumber: number; title: string }[] = [];
  const totalSteps = segments.filter((segment) => segment.type === 'step').length;
  const shouldGroupSteps = totalSteps > MAX_VISIBLE_STEPS;

  const flushSteps = () => {
    pushStepGroup(nodes, stepBuffer.splice(0, stepBuffer.length));
  };

  for (const segment of segments) {
    if (segment.type === 'section') {
      flushSteps();
      nodes.push({
        id: segment.section.id,
        kind: 'section',
        label: segment.section.title,
      });
      continue;
    }

    if (segment.type === 'branch') {
      flushSteps();
      nodes.push({
        id: segment.branch.id,
        kind: 'branch',
        label: segment.branch.title,
        detail: `${segment.branch.paths.length} paths`,
      });
      continue;
    }

    if (!shouldGroupSteps) {
      nodes.push({
        id: `step-${segment.stepNumber}`,
        kind: 'step',
        label: String(segment.stepNumber),
        detail: segment.step.title,
      });
      continue;
    }

    stepBuffer.push({ stepNumber: segment.stepNumber, title: segment.step.title });
  }

  flushSteps();
  nodes.push({ id: 'finish', kind: 'finish', label: 'Complete' });
  return nodes;
}
