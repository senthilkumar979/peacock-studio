import { describe, expect, it } from 'vitest';
import type { FlowStep } from '../types/events';
import type { StepResource } from '../types/stepResource';
import {
  collectReferencedScreenshotIds,
  countStepResources,
  countStepResourcesByStep,
  formatResourceLabel,
  getStepResourcesForStep,
  normalizeFlowTag,
  normalizeFlowTags,
  parseFlowTag,
  normalizeResourceLabel,
  normalizeStepResource,
  pruneScreenshotUrls,
  resolveResourceLabel,
  validateResourceUrl,
} from './stepResource';

function makeStep(overrides: Partial<FlowStep> = {}): FlowStep {
  return {
    id: 'step-1',
    event: {
      id: 'ev-1',
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Page',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-1',
    },
    title: 'Click',
    notes: '',
    generatedTitle: 'Click',
    generatedDescription: '',
    screenshotId: 'shot-1',
    ...overrides,
  };
}

describe('validateResourceUrl', () => {
  it('accepts http and https URLs', () => {
    expect(validateResourceUrl('https://example.com/path')).toBe(true);
    expect(validateResourceUrl('http://localhost:3000')).toBe(true);
  });

  it('rejects invalid or non-http schemes', () => {
    expect(validateResourceUrl('')).toBe(false);
    expect(validateResourceUrl('not-a-url')).toBe(false);
    expect(validateResourceUrl('ftp://files.example.com')).toBe(false);
    expect(validateResourceUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('formatResourceLabel', () => {
  it('returns hostname and trimmed path', () => {
    expect(formatResourceLabel('https://docs.example.com/guides/onboarding')).toBe(
      'docs.example.com/guides/onboarding',
    );
  });

  it('returns hostname only for root path', () => {
    expect(formatResourceLabel('https://example.com/')).toBe('example.com');
  });

  it('falls back to raw url when parse fails', () => {
    expect(formatResourceLabel('bad url')).toBe('bad url');
  });
});

describe('resolveResourceLabel', () => {
  it('prefers a stored page title over the URL host/path', () => {
    expect(
      resolveResourceLabel({
        url: 'https://docs.example.com/guides/onboarding',
        label: '  Onboarding Guide  ',
      }),
    ).toBe('Onboarding Guide');
  });

  it('falls back to the host/path label', () => {
    expect(resolveResourceLabel({ url: 'https://example.com/help' })).toBe('example.com/help');
  });
});

describe('normalizeResourceLabel', () => {
  it('trims, collapses whitespace, and drops empty values', () => {
    expect(normalizeResourceLabel('  Hello   World  ')).toBe('Hello World');
    expect(normalizeResourceLabel('   ')).toBeUndefined();
  });
});

describe('normalizeStepResource', () => {
  it('trims url and assigns defaults', () => {
    const resource = normalizeStepResource({
      documentId: 'doc-1',
      stepId: 'step-1',
      url: '  https://example.com  ',
    });
    expect(resource.url).toBe('https://example.com');
    expect(resource.label).toBeUndefined();
    expect(resource.id).toBeTruthy();
    expect(resource.sortOrder).toBe(0);
    expect(resource.createdAt).toBeGreaterThan(0);
  });

  it('keeps a provided page title', () => {
    const resource = normalizeStepResource({
      documentId: 'doc-1',
      stepId: 'step-1',
      url: 'https://example.com',
      label: '  Example Domain  ',
    });
    expect(resource.label).toBe('Example Domain');
  });

  it('throws for invalid url', () => {
    expect(() =>
      normalizeStepResource({ documentId: 'd', stepId: 's', url: 'nope' }),
    ).toThrow(/valid http or https/i);
  });
});

describe('collectReferencedScreenshotIds', () => {
  it('collects captured and custom screenshot ids', () => {
    const ids = collectReferencedScreenshotIds([
      makeStep({ screenshotId: 'a', customScreenshotId: 'custom' }),
    ]);
    expect(ids.has('custom')).toBe(true);
  });
});

describe('pruneScreenshotUrls', () => {
  it('drops unreferenced screenshot keys', () => {
    const pruned = pruneScreenshotUrls(
      { 'shot-1': 'data:1', orphan: 'data:2' },
      [makeStep()],
    );
    expect(pruned).toEqual({ 'shot-1': 'data:1' });
    expect(pruned.orphan).toBeUndefined();
  });
});

describe('resource counts', () => {
  const resources: StepResource[] = [
    { id: '1', documentId: 'd', stepId: 'a', url: 'https://a.com', sortOrder: 0, createdAt: 1 },
    { id: '2', documentId: 'd', stepId: 'a', url: 'https://b.com', sortOrder: 1, createdAt: 2 },
    { id: '3', documentId: 'd', stepId: 'b', url: 'https://c.com', sortOrder: 0, createdAt: 3 },
  ];

  it('counts all resources', () => {
    expect(countStepResources(resources)).toBe(3);
  });

  it('counts per step', () => {
    expect(countStepResourcesByStep(resources, 'a')).toBe(2);
  });

  it('returns sorted resources for a step', () => {
    expect(getStepResourcesForStep(resources, 'a').map((r) => r.id)).toEqual(['1', '2']);
  });
});

describe('parseFlowTag', () => {
  it('converts phrases to lowercase kebab-case', () => {
    expect(parseFlowTag('updated admin flow')).toEqual({ tag: 'updated-admin-flow' });
    expect(parseFlowTag('  Updated   Admin_Flow  ')).toEqual({ tag: 'updated-admin-flow' });
  });

  it('rejects empty values, non-letter starts, and overlong tags', () => {
    expect(parseFlowTag('   ')).toEqual({ error: 'empty' });
    expect(parseFlowTag('123-admin')).toEqual({ error: 'invalid-start' });
    expect(parseFlowTag('-admin')).toEqual({ tag: 'admin' });
    expect(parseFlowTag('a'.repeat(31))).toEqual({ error: 'too-long' });
  });
});

describe('normalizeFlowTags', () => {
  it('lowercases, kebab-cases, and dedupes', () => {
    expect(normalizeFlowTags([' Alpha ', 'alpha', 'Beta', ''])).toEqual(['alpha', 'beta']);
    expect(normalizeFlowTag('updated admin flow')).toBe('updated-admin-flow');
  });

  it('drops invalid tags and caps at five', () => {
    expect(normalizeFlowTags(['1start', 'valid-tag'])).toEqual(['valid-tag']);
    const tags = Array.from({ length: 8 }, (_, i) => `tag-${i}`);
    expect(normalizeFlowTags(tags)).toEqual(['tag-0', 'tag-1', 'tag-2', 'tag-3', 'tag-4']);
  });
});
