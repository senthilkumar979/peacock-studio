import { describe, expect, it } from 'vitest';
import type { FlowBranch, FlowOutlineItem, FlowStep } from '@peacock/shared';
import {
  buildDefaultShareSettings,
  buildShareQueryString,
  filterOutlineForViewer,
  parseShareSearchParams,
  resolveShareSettings,
} from './flowShareSettings';

const step = (id: string): FlowStep =>
  ({
    id,
    description: id,
  }) as unknown as FlowStep;

const branch = (id: string, pathIds: string[]): FlowBranch => ({
  id,
  kind: 'branch',
  title: id,
  description: '',
  paths: pathIds.map((pathId, order) => ({
    id: pathId,
    label: pathId,
    targetDocumentId: `doc-${pathId}`,
    targetTitle: pathId,
    targetDescription: '',
    fromStepId: 'a',
    toStepId: 'b',
    order,
  })),
});

const outline: FlowOutlineItem[] = [step('s1'), branch('b1', ['p1', 'p2']), branch('b2', ['p3'])];

describe('flowShareSettings', () => {
  it('builds defaults enabling all branches and paths', () => {
    expect(buildDefaultShareSettings(outline)).toEqual({
      includeMainFlow: true,
      enabledPathIds: ['p1', 'p2', 'p3'],
      enabledBranchIds: ['b1', 'b2'],
    });
  });

  it('intersects stored settings with current outline ids', () => {
    expect(
      resolveShareSettings(outline, {
        includeMainFlow: false,
        enabledPathIds: ['p1', 'gone'],
        enabledBranchIds: ['b2', 'gone'],
      }),
    ).toEqual({
      includeMainFlow: true,
      enabledPathIds: ['p1'],
      enabledBranchIds: ['b2'],
    });
  });

  it('parses share search params or returns null when absent', () => {
    expect(parseShareSearchParams(new URLSearchParams(), outline)).toBeNull();

    const filter = parseShareSearchParams(
      new URLSearchParams('paths=p1&branches=b1'),
      outline,
    );
    expect(filter).toEqual({
      includeMainFlow: true,
      enabledPathIds: new Set(['p1']),
      enabledBranchIds: new Set(['b1']),
    });
  });

  it('builds share query strings', () => {
    expect(
      buildShareQueryString({
        includeMainFlow: true,
        enabledPathIds: ['p1'],
        enabledBranchIds: ['b1'],
      }),
    ).toBe('?paths=p1&branches=b1');
    expect(
      buildShareQueryString({
        includeMainFlow: true,
        enabledPathIds: [],
        enabledBranchIds: [],
      }),
    ).toBe('');
  });

  it('filters outline branches/paths for the viewer', () => {
    const filtered = filterOutlineForViewer(outline, {
      includeMainFlow: true,
      enabledPathIds: new Set(['p2']),
      enabledBranchIds: new Set(['b1']),
    });

    expect(filtered).toHaveLength(2);
    expect(filtered[0]).toMatchObject({ id: 's1' });
    expect(filtered[1]).toMatchObject({
      id: 'b1',
      paths: [expect.objectContaining({ id: 'p2' })],
    });

    expect(filterOutlineForViewer(outline, null)).toBe(outline);
  });

  it('drops main-flow steps when includeMainFlow is false', () => {
    const filtered = filterOutlineForViewer(outline, {
      includeMainFlow: false,
      enabledPathIds: new Set(['p3']),
      enabledBranchIds: new Set(['b2']),
    });
    expect(filtered.every((item) => 'kind' in item && item.kind === 'branch')).toBe(true);
  });
});
