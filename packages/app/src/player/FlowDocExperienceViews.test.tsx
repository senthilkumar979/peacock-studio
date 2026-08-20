import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/usePrefetchFlowScreenshots', () => ({
  usePrefetchFlowScreenshots: () => ({ areScreenshotsReady: true }),
}));

vi.mock('@/player/FlowDocHubView', () => ({
  FlowDocHubView: () => <div>hub-view</div>,
}));
vi.mock('@/player/PlayerView', () => ({
  PlayerView: () => <div>player-view</div>,
}));
vi.mock('@/player/DocumentView', () => ({
  DocumentView: () => <div>document-view</div>,
}));

import { FlowDocExperienceViews } from './FlowDocExperienceViews';

describe('FlowDocExperienceViews', () => {
  it('renders hub view', () => {
    render(
      <MemoryRouter>
        <FlowDocExperienceViews
          documentId="doc-1"
          resolvedView="hub"
          onModeChange={vi.fn()}
          onOverview={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('hub-view')).toBeInTheDocument();
  });

  it('renders player view', () => {
    render(
      <MemoryRouter>
        <FlowDocExperienceViews
          documentId="doc-1"
          resolvedView="player"
          onModeChange={vi.fn()}
          onOverview={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('player-view')).toBeInTheDocument();
  });

  it('renders document view', () => {
    render(
      <MemoryRouter>
        <FlowDocExperienceViews
          documentId="doc-1"
          resolvedView="doc"
          onModeChange={vi.fn()}
          onOverview={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('document-view')).toBeInTheDocument();
  });
});
