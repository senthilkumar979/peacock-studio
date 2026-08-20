import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem } from '../types/events';
import { countPlayableStepsInSegments, getPlayerOutlineSegments } from './playerOutline';

const outline: FlowOutlineItem[] = [
  { id: 'sec-1', kind: 'section', title: 'Intro', description: '' },
  {
    id: 'step-1',
    title: '',
    notes: '',
    generatedTitle: 'Open app',
    generatedDescription: '',
    screenshotId: 'shot-1',
    event: {
      id: 'ev-1',
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Home',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-1',
    },
  },
  {
    id: 'branch-1',
    kind: 'branch',
    title: 'Choose',
    description: '',
    paths: [],
  },
  {
    id: 'step-2',
    title: '',
    notes: '',
    generatedTitle: 'Finish',
    generatedDescription: '',
    screenshotId: 'shot-2',
    event: {
      id: 'ev-2',
      type: 'page-view',
      timestamp: 2,
      url: 'https://example.com/done',
      title: 'Done',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-2',
    },
  },
];

describe('getPlayerOutlineSegments', () => {
  it('numbers steps and preserves sections and branches', () => {
    const segments = getPlayerOutlineSegments(outline);

    expect(segments).toEqual([
      { type: 'section', section: outline[0] },
      { type: 'step', step: outline[1], stepNumber: 1 },
      { type: 'branch', branch: outline[2] },
      { type: 'step', step: outline[3], stepNumber: 2 },
    ]);
  });
});

describe('countPlayableStepsInSegments', () => {
  it('counts only step segments', () => {
    const segments = getPlayerOutlineSegments(outline);
    expect(countPlayableStepsInSegments(segments)).toBe(2);
  });
});
