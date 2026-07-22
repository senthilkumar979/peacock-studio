import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem, FlowStep } from '../types/events';
import { countStepDomains, extractHostname } from './stepUrl';

function pageViewStep(url: string, id: string): FlowStep {
  return {
    id,
    title: 'View',
    notes: '',
    generatedTitle: 'View',
    generatedDescription: 'View',
    screenshotId: `s-${id}`,
    event: {
      id,
      type: 'page-view',
      timestamp: 1,
      url,
      title: 'Page',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: `s-${id}`,
    },
  };
}

function navigationStep(fromUrl: string, toUrl: string, id: string): FlowStep {
  return {
    id,
    title: 'Nav',
    notes: '',
    generatedTitle: 'Nav',
    generatedDescription: 'Nav',
    screenshotId: `s-${id}`,
    event: {
      id,
      type: 'navigation',
      timestamp: 1,
      fromUrl,
      toUrl,
    },
  };
}

describe('extractHostname', () => {
  it('returns lowercase hostname', () => {
    expect(extractHostname('https://App.Example.COM/path?q=1')).toBe('app.example.com');
  });

  it('returns null for invalid urls', () => {
    expect(extractHostname('')).toBeNull();
    expect(extractHostname('not-a-url')).toBeNull();
  });
});

describe('countStepDomains', () => {
  it('counts each step once per distinct domain', () => {
    const steps: FlowOutlineItem[] = [
      pageViewStep('https://a.example.com/one', '1'),
      pageViewStep('https://a.example.com/two', '2'),
      pageViewStep('https://b.example.com/', '3'),
    ];
    expect(countStepDomains(steps)).toEqual({
      'a.example.com': 2,
      'b.example.com': 1,
    });
  });

  it('counts navigation from/to once when same domain', () => {
    expect(
      countStepDomains([
        navigationStep('https://app.example.com/a', 'https://app.example.com/b', 'n1'),
      ]),
    ).toEqual({ 'app.example.com': 1 });
  });

  it('counts both domains when navigation crosses hosts', () => {
    expect(
      countStepDomains([
        navigationStep('https://a.example.com/a', 'https://b.example.com/b', 'n2'),
      ]),
    ).toEqual({
      'a.example.com': 1,
      'b.example.com': 1,
    });
  });
});
