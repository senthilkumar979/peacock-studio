import { describe, expect, it } from 'vitest';
import type { PlayerOutlineSegment } from '@peacock/shared';
import { buildFlowJourneyNodes } from './flowDocJourneyNodes';

function step(stepNumber: number, title = `Step ${stepNumber}`): PlayerOutlineSegment {
  return {
    type: 'step',
    stepNumber,
    step: {
      id: `s${stepNumber}`,
      title,
      notes: '',
      generatedTitle: title,
      generatedDescription: '',
      screenshotId: '',
      event: { type: 'click', timestamp: 0 } as never,
    },
  };
}

describe('buildFlowJourneyNodes', () => {
  it('lists individual steps when count is within the visible limit', () => {
    const nodes = buildFlowJourneyNodes([step(1, 'Open'), step(2, 'Click')]);
    expect(nodes[0]).toEqual({ id: 'start', kind: 'start', label: 'Start' });
    expect(nodes).toContainEqual({
      id: 'step-1',
      kind: 'step',
      label: '1',
      detail: 'Open',
    });
    expect(nodes.at(-1)).toEqual({ id: 'finish', kind: 'finish', label: 'Complete' });
  });

  it('groups steps when there are more than five', () => {
    const segments = [1, 2, 3, 4, 5, 6].map((n) => step(n));
    const nodes = buildFlowJourneyNodes(segments);
    expect(nodes.some((n) => n.kind === 'step-group')).toBe(true);
    expect(nodes.find((n) => n.kind === 'step-group')?.label).toBe('6 steps');
  });

  it('flushes steps around sections and branches', () => {
    const nodes = buildFlowJourneyNodes([
      step(1),
      {
        type: 'section',
        section: { id: 'sec', kind: 'section', title: 'Part A', description: '' },
      },
      step(2),
      {
        type: 'branch',
        branch: {
          id: 'br',
          kind: 'branch',
          title: 'Choose',
          description: '',
          paths: [
            {
              id: 'p1',
              label: 'A',
              targetDocumentId: 'd',
              targetTitle: '',
              targetDescription: '',
              fromStepId: 'a',
              toStepId: 'b',
              order: 0,
            },
          ],
        },
      },
    ]);

    expect(nodes.map((n) => n.kind)).toEqual([
      'start',
      'step',
      'section',
      'step',
      'branch',
      'finish',
    ]);
    expect(nodes.find((n) => n.kind === 'branch')?.detail).toBe('1 paths');
  });
});
