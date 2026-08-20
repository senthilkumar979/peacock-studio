import { act, renderHook } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowBranch } from '@peacock/shared';
import type { DocumentStepIndexItem } from '@/player/documentStepIndexTypes';
import { useDocumentHashNavigation } from './useDocumentHashNavigation';

async function flushAnimationFrames() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
}

const PATH_ID = '11111111-1111-4111-8111-111111111111';
const STEP_ID = '22222222-2222-4222-8222-222222222222';

function makeBranch(): FlowBranch {
  return {
    id: 'branch-1',
    kind: 'branch',
    title: 'Branch',
    description: '',
    paths: [
      {
        id: PATH_ID,
        label: 'Path A',
        targetDocumentId: 'doc-2',
        targetTitle: 'Doc 2',
        targetDescription: '',
        fromStepId: 's1',
        toStepId: 's2',
        order: 0,
      },
    ],
  };
}

describe('useDocumentHashNavigation', () => {
  beforeEach(() => {
    window.location.hash = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    window.location.hash = '';
    document.body.innerHTML = '';
  });

  it('scrolls to existing hash and sets active outline item', async () => {
    const anchor = document.createElement('div');
    anchor.id = 'step-anchor';
    document.body.appendChild(anchor);

    const indexItems: DocumentStepIndexItem[] = [
      {
        type: 'step',
        anchorId: 'step-anchor',
        stepId: 'step-1',
        stepNumber: 1,
        title: 'Step',
      },
    ];
    const indexItemsRef = createRef<DocumentStepIndexItem[]>();
    indexItemsRef.current = indexItems;

    const setActiveItemId = vi.fn();
    const scrollToHash = vi.fn();
    const selectPath = vi.fn();

    window.location.hash = '#step-anchor';

    renderHook(() =>
      useDocumentHashNavigation({
        branches: [],
        selectedPathByBranchId: {},
        linkedContentByPathId: {},
        selectPath,
        indexItemsRef: indexItemsRef as RefObject<DocumentStepIndexItem[]>,
        setActiveItemId,
        scrollToHash,
      }),
    );

    await flushAnimationFrames();
    expect(setActiveItemId).toHaveBeenCalledWith('step-1');
    expect(scrollToHash).toHaveBeenCalledWith('step-anchor');
  });

  it('selects linked path when hash targets another path', () => {
    const selectPath = vi.fn();
    const setActiveItemId = vi.fn();
    const scrollToHash = vi.fn();
    const indexItemsRef = createRef<DocumentStepIndexItem[]>();
    indexItemsRef.current = [];

    window.location.hash = `#linked-path-${PATH_ID}`;

    renderHook(() =>
      useDocumentHashNavigation({
        branches: [makeBranch()],
        selectedPathByBranchId: {},
        linkedContentByPathId: {},
        selectPath,
        indexItemsRef: indexItemsRef as RefObject<DocumentStepIndexItem[]>,
        setActiveItemId,
        scrollToHash,
      }),
    );

    expect(selectPath).toHaveBeenCalledWith(
      'branch-1',
      expect.objectContaining({ id: PATH_ID }),
    );
  });

  it('resolves linked step outline ids when element exists', async () => {
    const hash = `linked-${PATH_ID}-${STEP_ID}`;
    const el = document.createElement('div');
    el.id = hash;
    document.body.appendChild(el);

    const indexItemsRef = createRef<DocumentStepIndexItem[]>();
    indexItemsRef.current = [];
    const setActiveItemId = vi.fn();
    const scrollToHash = vi.fn();

    window.location.hash = `#${hash}`;

    renderHook(() =>
      useDocumentHashNavigation({
        branches: [makeBranch()],
        selectedPathByBranchId: { 'branch-1': PATH_ID },
        linkedContentByPathId: {},
        selectPath: vi.fn(),
        indexItemsRef: indexItemsRef as RefObject<DocumentStepIndexItem[]>,
        setActiveItemId,
        scrollToHash,
      }),
    );

    await flushAnimationFrames();
    expect(setActiveItemId).toHaveBeenCalledWith(`${PATH_ID}:${STEP_ID}`);
    expect(scrollToHash).toHaveBeenCalledWith(hash);
  });

  it('retries pending hash when linked content arrives', async () => {
    const hash = 'late-anchor';
    const indexItemsRef = createRef<DocumentStepIndexItem[]>();
    indexItemsRef.current = [
      {
        type: 'step',
        anchorId: hash,
        stepId: 'late-step',
        stepNumber: 2,
        title: 'Late',
      },
    ];
    const setActiveItemId = vi.fn();
    const scrollToHash = vi.fn();

    window.location.hash = `#${hash}`;

    const { rerender } = renderHook(
      ({ linked }: { linked: Record<string, unknown> }) =>
        useDocumentHashNavigation({
          branches: [],
          selectedPathByBranchId: {},
          linkedContentByPathId: linked,
          selectPath: vi.fn(),
          indexItemsRef: indexItemsRef as RefObject<DocumentStepIndexItem[]>,
          setActiveItemId,
          scrollToHash,
        }),
      { initialProps: { linked: {} } },
    );

    expect(scrollToHash).not.toHaveBeenCalled();

    const el = document.createElement('div');
    el.id = hash;
    document.body.appendChild(el);

    act(() => {
      rerender({ linked: { [PATH_ID]: { steps: [] } } });
    });

    await flushAnimationFrames();
    expect(setActiveItemId).toHaveBeenCalledWith('late-step');
    expect(scrollToHash).toHaveBeenCalledWith(hash);
  });

  it('reacts to hashchange events', async () => {
    const el = document.createElement('div');
    el.id = 'changed';
    document.body.appendChild(el);

    const indexItemsRef = createRef<DocumentStepIndexItem[]>();
    indexItemsRef.current = [
      {
        type: 'overview',
        anchorId: 'changed',
        itemId: 'overview',
        title: 'Overview',
      },
    ];
    const setActiveItemId = vi.fn();
    const scrollToHash = vi.fn();

    renderHook(() =>
      useDocumentHashNavigation({
        branches: [],
        selectedPathByBranchId: {},
        linkedContentByPathId: {},
        selectPath: vi.fn(),
        indexItemsRef: indexItemsRef as RefObject<DocumentStepIndexItem[]>,
        setActiveItemId,
        scrollToHash,
      }),
    );

    act(() => {
      window.location.hash = '#changed';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await flushAnimationFrames();
    expect(setActiveItemId).toHaveBeenCalledWith('overview');
    expect(scrollToHash).toHaveBeenCalledWith('changed');
  });
});
