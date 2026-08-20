import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ routeId: 'route-1' }) };
});

vi.mock('@/hooks/useSavedRoute', () => ({
  useSavedRoute: () => ({
    route: { id: 'route-1', title: 'Route' },
    isLoading: false,
    isLoaded: true,
    error: null,
  }),
}));

vi.mock('@/hooks/usePersistRoute', () => ({
  usePersistRoute: vi.fn(),
}));

const routeState = {
  route: { id: 'route-1', title: 'Route', nodes: [], edges: [] },
  setSelectedNodeId: vi.fn(),
};

vi.mock('@/store/routeBuilderStore', () => ({
  useRouteBuilderStore: (selector: (s: typeof routeState) => unknown) => selector(routeState),
}));

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn(async () => []),
}));

vi.mock('@/utils/routeValidation', () => ({
  validateRoute: () => [],
}));

vi.mock('@/route-builder/RouteBuilderToolbar', () => ({
  RouteBuilderToolbar: () => <div>route-toolbar</div>,
}));
vi.mock('@/route-builder/RouteCanvas', () => ({ RouteCanvas: () => <div>route-canvas</div> }));
vi.mock('@/route-builder/RouteCanvasToolbar', () => ({
  RouteCanvasToolbar: () => <div>canvas-toolbar</div>,
}));
vi.mock('@/route-builder/RouteListView', () => ({ RouteListView: () => null }));
vi.mock('@/route-builder/RouteNodeDetailsPanel', () => ({
  RouteNodeDetailsPanel: () => <div>node-details</div>,
}));
vi.mock('@/route-builder/RouteValidationBanner', () => ({
  RouteValidationBanner: () => null,
}));

import { RouteBuilder } from './RouteBuilder';

describe('RouteBuilder', () => {
  it('renders route builder canvas layout', () => {
    renderAtRoute('/routes/route-1/edit', <RouteBuilder />);
    expect(screen.getByText('route-toolbar')).toBeInTheDocument();
    expect(screen.getByText('route-canvas')).toBeInTheDocument();
    expect(screen.getByText('node-details')).toBeInTheDocument();
  });
});
