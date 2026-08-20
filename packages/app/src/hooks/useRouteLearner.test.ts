import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedRoute } from '@/types/route';
import { useRouteLearner } from './useRouteLearner';

const route: SavedRoute = {
  id: 'r1',
  title: 'Route',
  description: '',
  status: 'live',
  entryNodeId: 'c1',
  nodes: [
    {
      id: 'c1',
      type: 'chapter',
      title: 'Intro',
      description: '',
      peacocks: [
        { id: 'p0', documentId: 'd0', order: 0 },
        { id: 'p1', documentId: 'd1', order: 1 },
      ],
      position: { x: 0, y: 0 },
    },
    {
      id: 'c2',
      type: 'chapter',
      title: 'Outro',
      description: '',
      peacocks: [{ id: 'p2', documentId: 'd2', order: 0 }],
      position: { x: 0, y: 0 },
    },
  ],
  edges: [{ id: 'e1', sourceNodeId: 'c1', targetNodeId: 'c2' }],
  createdAt: 1,
  updatedAt: 2,
};

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ routeId: 'r1' })),
}));

vi.mock('@/hooks/useSavedRoute', () => ({
  useSavedRoute: vi.fn(() => ({
    route,
    isLoading: false,
    isLoaded: true,
    error: null,
  })),
}));

vi.mock('@/hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}));

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn().mockResolvedValue([]),
}));

describe('useRouteLearner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes learner state and pending intro transition', async () => {
    const { result } = renderHook(() => useRouteLearner());
    await waitFor(() => expect(result.current.state).toBeTruthy());
    expect(result.current.route?.id).toBe('r1');
    expect(result.current.segments.length).toBeGreaterThan(0);
    expect(result.current.hasPlayableContent).toBe(true);
    await waitFor(() => expect(result.current.pendingTransition).toBeTruthy());
  });

  it('confirms intro, advances, and retreats across segments', async () => {
    const { result } = renderHook(() => useRouteLearner());
    await waitFor(() => expect(result.current.pendingTransition).toBeTruthy());

    act(() => {
      result.current.confirmTransition();
    });
    expect(result.current.pendingTransition).toBeNull();

    act(() => {
      result.current.handleDocumentLoaded(2);
    });
    expect(result.current.stepCount).toBe(2);

    act(() => {
      result.current.handleNext();
    });
    expect(result.current.state?.stepIndex).toBe(1);

    act(() => {
      result.current.handleNext();
    });
    expect(result.current.pendingTransition).toBeTruthy();

    act(() => {
      result.current.confirmTransition();
    });

    act(() => {
      result.current.handleSelectSegment(0);
    });
    expect(result.current.activeSegmentIndex).toBe(0);

    act(() => {
      result.current.goToLastSegment();
    });
    expect(result.current.activeSegmentIndex).toBe(result.current.segments.length - 1);

    act(() => {
      result.current.goToFirstSegment();
    });
    expect(result.current.activeSegmentIndex).toBe(0);
  });

  it('updates branch/form/interest responses when on those nodes', async () => {
    const branched: SavedRoute = {
      ...route,
      entryNodeId: 'b1',
      nodes: [
        {
          id: 'b1',
          type: 'branch',
          title: 'Pick',
          description: '',
          options: [{ id: 'opt', label: 'Opt' }],
          position: { x: 0, y: 0 },
        },
        {
          id: 'f1',
          type: 'form',
          title: 'Form',
          description: '',
          fields: [{ id: 'name', label: 'Name', type: 'text', required: true }],
          position: { x: 0, y: 0 },
        },
        {
          id: 'i1',
          type: 'interest',
          title: 'Interest',
          description: '',
          topics: [{ id: 't1', label: 'T' }],
          allowMultiple: false,
          position: { x: 0, y: 0 },
        },
        route.nodes[0]!,
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'b1', targetNodeId: 'f1', sourceHandle: 'opt' },
        { id: 'e2', sourceNodeId: 'f1', targetNodeId: 'i1' },
        { id: 'e3', sourceNodeId: 'i1', targetNodeId: 'c1', sourceHandle: 't1' },
      ],
    };

    const { useSavedRoute } = await import('@/hooks/useSavedRoute');
    vi.mocked(useSavedRoute).mockReturnValue({
      route: branched,
      isLoading: false,
      isLoaded: true,
      error: null,
    });

    const { result } = renderHook(() => useRouteLearner());
    await waitFor(() => expect(result.current.branchActive).toBe(true));

    act(() => {
      result.current.handleBranchSelect('opt');
    });
    expect(result.current.state?.branchChoices.b1).toBe('opt');

    act(() => {
      result.current.handleNext();
    });
    await waitFor(() => expect(result.current.formActive).toBe(true));

    act(() => {
      result.current.handleFormChange('name', 'Ada');
    });
    expect(result.current.formResponses.name).toBe('Ada');

    act(() => {
      result.current.handleNext();
    });
    await waitFor(() => expect(result.current.interestActive).toBe(true));

    act(() => {
      result.current.handleInterestToggle('t1');
    });
    expect(result.current.selectedTopicIds).toContain('t1');
  });
});
