import { describe, expect, it } from 'vitest';
import type { FlowStep } from '@peacock/shared';
import { buildPdfStepContentSlices } from './pdfStepLayout';

const baseStep: FlowStep = {
  id: 'step-1',
  title: 'Submit expense',
  notes: 'Short instruction',
  generatedTitle: 'Submit expense',
  generatedDescription: 'Generated',
  screenshotId: 'shot-1',
  event: {
    id: 'ev-1',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

describe('buildPdfStepContentSlices', () => {
  it('returns a single page for short content', () => {
    const slices = buildPdfStepContentSlices({
      step: baseStep,
      resources: [],
      resolveInstructions: (step) => step.notes,
    });
    expect(slices).toHaveLength(1);
    expect(slices[0]?.showScreenshot).toBe(true);
    expect(slices[0]?.instructions).toBe('Short instruction');
  });

  it('splits long detailed descriptions across pages', () => {
    const longText = Array.from({ length: 400 }, (_, index) => `word${index}`).join(' ');
    const slices = buildPdfStepContentSlices({
      step: { ...baseStep, detailedDescription: `<p>${longText}</p>` },
      resources: [{ id: 'r1', documentId: 'd', stepId: 'step-1', url: 'https://a.com', sortOrder: 0, createdAt: 1 }],
      resolveInstructions: (step) => step.notes,
    });
    expect(slices.length).toBeGreaterThan(1);
    expect(slices.at(-1)?.showScreenshot).toBe(true);
    expect(slices[0]?.resources).toHaveLength(1);
  });
});
