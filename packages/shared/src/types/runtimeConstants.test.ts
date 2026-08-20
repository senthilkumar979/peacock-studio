import { describe, expect, it } from 'vitest';
import {
  DATA_CLASSIFICATIONS,
  SECRET_PLACEHOLDER,
} from './dataClassification';
import {
  DEFAULT_CAPTURE_CROP,
  DEFAULT_CAPTURE_EDITOR_SETTINGS,
} from './capture';
import {
  getPlayableSteps,
  isFlowBranch,
  isFlowSection,
  isFlowStep,
  type FlowOutlineItem,
} from './events';

describe('runtime type constants', () => {
  it('exports data classification constants', () => {
    expect(DATA_CLASSIFICATIONS).toEqual(['public', 'internal', 'sensitive', 'secret']);
    expect(SECRET_PLACEHOLDER).toBe('••••••••');
  });

  it('exports capture editor defaults', () => {
    expect(DEFAULT_CAPTURE_CROP).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(DEFAULT_CAPTURE_EDITOR_SETTINGS.backgroundPresetId).toBe('rose-gold');
    expect(DEFAULT_CAPTURE_EDITOR_SETTINGS.crop).toEqual(DEFAULT_CAPTURE_CROP);
  });
});

describe('outline type guards', () => {
  const outline: FlowOutlineItem[] = [
    { id: 's', kind: 'section', title: 'S', description: '' },
    { id: 'b', kind: 'branch', title: 'B', description: '', paths: [] },
    {
      id: 'step',
      title: '',
      notes: '',
      generatedTitle: 'Step',
      generatedDescription: '',
      screenshotId: 'shot',
      event: {
        id: 'e',
        type: 'page-view',
        timestamp: 1,
        url: 'https://example.com',
        title: 'Home',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        screenshotId: 'shot',
      },
    },
  ];

  it('discriminates sections, branches, and steps', () => {
    expect(isFlowSection(outline[0]!)).toBe(true);
    expect(isFlowBranch(outline[1]!)).toBe(true);
    expect(isFlowStep(outline[2]!)).toBe(true);
    expect(getPlayableSteps(outline)).toHaveLength(1);
  });
});
