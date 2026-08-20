import { describe, expect, it } from 'vitest';
import {
  MANUAL_STEP_PLACEHOLDER_SCREENSHOT,
  createFlowBranch,
  createFlowSection,
  createManualFlowStep,
} from './createManualOutlineItem';

describe('createManualFlowStep', () => {
  it('creates a page-view step with manual defaults', () => {
    const step = createManualFlowStep();

    expect(step.event.type).toBe('page-view');
    expect(step.title).toBe('New step');
    expect(step.generatedTitle).toBe('New step');
    expect(step.generatedDescription).toContain('learner');
    expect(step.event.type === 'page-view' && step.event.viewport.width).toBe(1280);
  });
});

describe('createFlowSection', () => {
  it('uses default title when omitted', () => {
    const section = createFlowSection();
    expect(section.kind).toBe('section');
    expect(section.title).toBe('New section');
    expect(section.description).toBe('');
    expect(section.id).toBeTruthy();
  });

  it('accepts custom title and description', () => {
    const section = createFlowSection('Setup', 'Get ready');
    expect(section.title).toBe('Setup');
    expect(section.description).toBe('Get ready');
  });
});

describe('createFlowBranch', () => {
  it('uses default title when omitted', () => {
    const branch = createFlowBranch();
    expect(branch.kind).toBe('branch');
    expect(branch.title).toBe('Choose a path');
    expect(branch.paths).toEqual([]);
  });

  it('accepts custom title and description', () => {
    const branch = createFlowBranch('Pick plan', 'Optional');
    expect(branch.title).toBe('Pick plan');
    expect(branch.description).toBe('Optional');
  });
});

describe('MANUAL_STEP_PLACEHOLDER_SCREENSHOT', () => {
  it('re-exports the placeholder data URL', () => {
    expect(MANUAL_STEP_PLACEHOLDER_SCREENSHOT.startsWith('data:image/svg+xml')).toBe(true);
  });
});
