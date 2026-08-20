import { describe, expect, it } from 'vitest';
import type { FlowOutlineItem, FlowStep } from '../types/events';
import { countStepDomains, extractHostname, getFlowEventUrl, getStepUrl } from './stepUrl';

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

describe('getFlowEventUrl / getStepUrl', () => {
  it('reads urls from navigation, page-view, and action events', () => {
    const nav = navigationStep('https://a.com', 'https://b.com', 'n');
    const page = pageViewStep('https://page.example.com', 'p');
    const click: FlowStep = {
      ...page,
      id: 'c',
      event: {
        id: 'c',
        type: 'click',
        timestamp: 1,
        url: 'https://click.example.com',
        title: 'Home',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        position: { x: 0, y: 0, xPercent: 0, yPercent: 0 },
        element: {
          tagName: 'button',
          type: 'button',
          id: '',
          name: null,
          role: null,
          classes: [],
          selector: 'button',
          xpath: '//button',
          innerText: '',
          innerHTML: null,
          label: {
            text: null,
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
        screenshotId: 's-c',
      },
    };

    expect(getFlowEventUrl(nav.event)).toBe('https://b.com');
    expect(getStepUrl(nav)).toBe('https://b.com');
    expect(getFlowEventUrl(page.event)).toBe('https://page.example.com');
    expect(getStepUrl(page)).toBe('https://page.example.com');
    expect(getFlowEventUrl(click.event)).toBe('https://click.example.com');
    expect(getStepUrl(click)).toBe('https://click.example.com');
  });
});

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
