import { describe, expect, it } from 'vitest';
import type { PageViewEvent } from '../types/events';
import { createFlowStep, createId } from './createFlowStep';

describe('createId', () => {
  it('returns a UUID string', () => {
    const id = createId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

describe('createFlowStep', () => {
  it('builds a step from an event and enriches titles', () => {
    const event: PageViewEvent = {
      id: 'ev-1',
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com/docs',
      title: 'Docs',
      viewport: { width: 1280, height: 720, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-1',
    };

    const step = createFlowStep(event, 'shot-1');

    expect(step.id).toBeTruthy();
    expect(step.event).toBe(event);
    expect(step.screenshotId).toBe('shot-1');
    expect(step.notes).toBe('');
    expect(step.detailedDescription).toBe('');
    expect(step.generatedTitle.length).toBeGreaterThan(0);
    expect(step.generatedDescription.length).toBeGreaterThan(0);
  });
});
