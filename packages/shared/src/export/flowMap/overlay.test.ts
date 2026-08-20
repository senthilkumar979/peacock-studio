import { describe, expect, it } from 'vitest';
import { buildWorkflowGraph } from '../workflowGraph/buildWorkflowGraph';
import type { FlowOutlineItem } from '../../types/events';
import {
  applyFlowMapOverlayPositions,
  EMPTY_FLOW_MAP_OVERLAY,
  parseFlowMapOverlay,
  pruneFlowMapOverlay,
} from './overlay';

const outline: FlowOutlineItem[] = [
  {
    id: 'section-1',
    kind: 'section',
    title: 'Onboarding',
    description: 'Get started',
  },
  {
    id: 'step-1',
    title: '',
    notes: 'Reviewer note from recording',
    generatedTitle: 'Click Sign in',
    generatedDescription: 'Opens the login form',
    screenshotId: 'shot-1',
    event: {
      id: 'event-1',
      type: 'click',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Home',
      viewport: { width: 1280, height: 720, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 0.5, y: 0.5, xPercent: 50, yPercent: 50 },
      element: {
        tagName: 'button',
        type: 'button',
        id: '',
        name: null,
        role: null,
        classes: [],
        selector: 'button',
        xpath: '//button',
        innerText: 'Sign in',
        innerHTML: null,
        label: {
          text: 'Sign in',
          htmlFor: null,
          ariaLabel: null,
          ariaLabelledBy: null,
          placeholder: null,
        },
        valuePreview: null,
        classification: 'public',
        maskedValue: null,
        dataAttributes: {},
        ariaDescription: null,
        parent: null,
        grandparent: null,
        isButton: true,
        isLink: false,
        isInput: false,
        isSelect: false,
        isCheckbox: false,
        isRadio: false,
        isOption: false,
        isTab: false,
        isMenuItem: false,
        isCombobox: false,
        isContentEditable: false,
      },
      screenshotId: 'shot-1',
    },
  },
];

describe('parseFlowMapOverlay', () => {
  it('returns null for invalid metadata', () => {
    expect(parseFlowMapOverlay(null)).toBeNull();
    expect(parseFlowMapOverlay({ version: 2 })).toBeNull();
  });

  it('parses a valid overlay', () => {
    const parsed = parseFlowMapOverlay({
      version: 1,
      nodePositions: { 'step-step-1': { x: 10, y: 20 } },
      nodeStatuses: { 'step-step-1': 'approved' },
      nodeNotes: { 'step-step-1': 'Looks good' },
      stickyNotes: [{ id: 'note-1', x: 100, y: 200, text: 'Check edge case' }],
    });

    expect(parsed).toEqual({
      version: 1,
      nodePositions: { 'step-step-1': { x: 10, y: 20 } },
      nodeStatuses: { 'step-step-1': 'approved' },
      nodeNotes: { 'step-step-1': 'Looks good' },
      stickyNotes: [{ id: 'note-1', x: 100, y: 200, text: 'Check edge case' }],
    });
  });

  it('skips invalid positions, statuses, notes, and sticky notes', () => {
    const parsed = parseFlowMapOverlay({
      version: 1,
      nodePositions: {
        good: { x: 1, y: 2 },
        bad: { x: '1', y: 2 },
        infinite: { x: Number.POSITIVE_INFINITY, y: 1 },
      },
      nodeStatuses: {
        good: 'needs_work',
        bad: 'shipped',
      },
      nodeNotes: {
        good: 'ok',
        bad: 12,
      },
      stickyNotes: [
        { id: '  ', x: 1, y: 2, text: 'x' },
        { id: 'n1', x: 3, y: 4, text: 9 },
        { id: 'n2', x: 5, y: 6, text: 'kept', color: '  red  ' },
        null,
      ],
    });

    expect(parsed).toEqual({
      version: 1,
      nodePositions: { good: { x: 1, y: 2 } },
      nodeStatuses: { good: 'needs_work' },
      nodeNotes: { good: 'ok' },
      stickyNotes: [
        { id: 'n1', x: 3, y: 4, text: '' },
        { id: 'n2', x: 5, y: 6, text: 'kept', color: 'red' },
      ],
    });
  });
});

describe('pruneFlowMapOverlay', () => {
  it('drops overlay keys for nodes no longer in the graph', () => {
    const graph = buildWorkflowGraph('Demo', outline);
    const overlay = {
      ...EMPTY_FLOW_MAP_OVERLAY,
      nodePositions: {
        'step-step-1': { x: 1, y: 2 },
        'step-removed': { x: 3, y: 4 },
      },
      nodeStatuses: {
        'step-step-1': 'in_review' as const,
        'step-removed': 'draft' as const,
      },
    };

    const pruned = pruneFlowMapOverlay(
      {
        ...overlay,
        nodeNotes: {
          'step-step-1': 'keep',
          'step-removed': 'drop',
        },
      },
      graph,
    );
    expect(pruned.nodePositions).toEqual({ 'step-step-1': { x: 1, y: 2 } });
    expect(pruned.nodeStatuses).toEqual({ 'step-step-1': 'in_review' });
    expect(pruned.nodeNotes).toEqual({ 'step-step-1': 'keep' });
    expect(pruned.stickyNotes).toEqual([]);
  });
});

describe('applyFlowMapOverlayPositions', () => {
  it('overrides auto positions when overlay has saved coordinates', () => {
    const auto = new Map([
      ['root', { x: 0, y: 0 }],
      ['step-step-1', { x: 50, y: 100 }],
    ]);

    const merged = applyFlowMapOverlayPositions(auto, {
      ...EMPTY_FLOW_MAP_OVERLAY,
      nodePositions: { 'step-step-1': { x: 200, y: 300 } },
    });

    expect(merged.get('root')).toEqual({ x: 0, y: 0 });
    expect(merged.get('step-step-1')).toEqual({ x: 200, y: 300 });
  });

  it('returns auto positions when overlay is missing', () => {
    const auto = new Map([['root', { x: 1, y: 2 }]]);
    expect(applyFlowMapOverlayPositions(auto, null)).toBe(auto);
    expect(applyFlowMapOverlayPositions(auto, undefined)).toBe(auto);
  });
});
