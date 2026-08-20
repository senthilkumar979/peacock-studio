import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PlayerOutlineSegment } from '@peacock/shared';
import { FlowDocJourneyStrip } from './FlowDocJourneyStrip';

const step = {
  id: 'step-1',
  title: 'Open',
  notes: '',
  generatedTitle: 'Open',
  generatedDescription: '',
  screenshotId: 's1',
  event: {
    id: 'ev',
    type: 'page-view' as const,
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 's1',
  },
};

describe('FlowDocJourneyStrip', () => {
  it('smoke-renders journey nodes from segments', () => {
    const segments: PlayerOutlineSegment[] = [
      { type: 'section', section: { id: 'sec', kind: 'section', title: 'Setup', description: '' } },
      { type: 'step', step, stepNumber: 1 },
    ];

    render(
      <FlowDocJourneyStrip
        segments={segments}
        stepCount={1}
        sectionCount={1}
        branchCount={0}
      />,
    );

    expect(screen.getByRole('region', { name: 'Flow structure' })).toBeInTheDocument();
    expect(screen.getAllByText('Start').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Complete').length).toBeGreaterThan(0);
  });
});
