import type { FlowOutlineItem, FlowSection, FlowStep } from '../types/events';
import { isFlowSection, isFlowStep } from '../types/events';

export type PlayerOutlineSegment =
  | { type: 'section'; section: FlowSection }
  | { type: 'step'; step: FlowStep; stepNumber: number };

export function getPlayerOutlineSegments(items: FlowOutlineItem[]): PlayerOutlineSegment[] {
  const segments: PlayerOutlineSegment[] = [];
  let stepNumber = 0;

  for (const item of items) {
    if (isFlowSection(item)) {
      segments.push({ type: 'section', section: item });
      continue;
    }
    if (isFlowStep(item)) {
      stepNumber += 1;
      segments.push({ type: 'step', step: item, stepNumber });
    }
  }

  return segments;
}

export function countPlayableStepsInSegments(segments: PlayerOutlineSegment[]): number {
  return segments.filter((segment) => segment.type === 'step').length;
}
