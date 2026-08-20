import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const prefetchState = {
  areScreenshotsReady: true,
  screenshotsNetworkBlocked: false,
};

vi.mock('@/hooks/usePrefetchFlowScreenshots', () => ({
  usePrefetchFlowScreenshots: () => prefetchState,
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
    prefetchState.screenshotsNetworkBlocked = false;
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
    prefetchState.screenshotsNetworkBlocked = false;
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
    prefetchState.screenshotsNetworkBlocked = false;
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

  it('shows corporate network panel when screenshots are blocked', () => {
    prefetchState.screenshotsNetworkBlocked = true;
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
    expect(
      screen.getByRole('heading', {
        name: /organization network is blocking Peacock cloud services/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Clerk for authentication/i)).toBeInTheDocument();
    expect(screen.queryByText('player-view')).not.toBeInTheDocument();
  });
});
