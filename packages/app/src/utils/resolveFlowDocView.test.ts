import { describe, expect, it } from 'vitest';
import { resolveExplicitViewFromUrl, resolveFlowDocView } from './resolveFlowDocView';

describe('resolveExplicitViewFromUrl', () => {
  it('reads hub/doc/player from view query', () => {
    expect(resolveExplicitViewFromUrl(new URLSearchParams('view=hub'), '')).toBe('hub');
    expect(resolveExplicitViewFromUrl(new URLSearchParams('view=doc'), '')).toBe('doc');
    expect(resolveExplicitViewFromUrl(new URLSearchParams('view=player'), '')).toBe('player');
  });

  it('infers doc from known anchors', () => {
    expect(resolveExplicitViewFromUrl(new URLSearchParams(), '#flow-details')).toBe('doc');
    expect(resolveExplicitViewFromUrl(new URLSearchParams(), 'step-abc')).toBe('doc');
    expect(resolveExplicitViewFromUrl(new URLSearchParams(), '#linked-path-1')).toBe('doc');
  });

  it('returns null for unknown view and empty/unknown hash', () => {
    expect(resolveExplicitViewFromUrl(new URLSearchParams('view=other'), '')).toBeNull();
    expect(resolveExplicitViewFromUrl(new URLSearchParams(), '')).toBeNull();
    expect(resolveExplicitViewFromUrl(new URLSearchParams(), '#unknown')).toBeNull();
  });
});

describe('resolveFlowDocView', () => {
  it('prefers explicit URL view over share mode and default', () => {
    expect(
      resolveFlowDocView(new URLSearchParams('view=player'), '', 'hub', 'doc'),
    ).toBe('player');
  });

  it('uses share link view when URL has no explicit view', () => {
    expect(resolveFlowDocView(new URLSearchParams(), '', 'hub', 'player')).toBe('player');
  });

  it('falls back to default view', () => {
    expect(resolveFlowDocView(new URLSearchParams(), '', 'doc', null)).toBe('doc');
  });
});
