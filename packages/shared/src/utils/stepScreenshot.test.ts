import { describe, expect, it } from 'vitest';
import type { FlowStep } from '../types/events';
import {
  getCapturedScreenshotId,
  getStepScreenshotId,
  getStepScreenshotUrl,
  hasCustomStepScreenshot,
} from './stepScreenshot';

function makeStep(overrides: Partial<FlowStep> & Pick<FlowStep, 'event'>): FlowStep {
  return {
    id: 'step-1',
    title: '',
    notes: '',
    generatedTitle: '',
    generatedDescription: '',
    screenshotId: '',
    ...overrides,
  };
}

describe('getCapturedScreenshotId', () => {
  it('prefers step.screenshotId', () => {
    expect(
      getCapturedScreenshotId(
        makeStep({
          screenshotId: 'from-step',
          event: {
            id: '1',
            type: 'page-view',
            timestamp: 1,
            url: 'https://example.com',
            title: 'Home',
            viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
            screenshotId: 'from-event',
          },
        }),
      ),
    ).toBe('from-step');
  });

  it('returns empty for navigation without step screenshot', () => {
    expect(
      getCapturedScreenshotId(
        makeStep({
          event: {
            id: '1',
            type: 'navigation',
            timestamp: 1,
            fromUrl: 'https://a.com',
            toUrl: 'https://b.com',
          },
        }),
      ),
    ).toBe('');
  });

  it('falls back to page-view and other event screenshot ids', () => {
    expect(
      getCapturedScreenshotId(
        makeStep({
          event: {
            id: '1',
            type: 'page-view',
            timestamp: 1,
            url: 'https://example.com',
            title: 'Home',
            viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
            screenshotId: 'pv-shot',
          },
        }),
      ),
    ).toBe('pv-shot');

    expect(
      getCapturedScreenshotId(
        makeStep({
          event: {
            id: '1',
            type: 'click',
            timestamp: 1,
            url: 'https://example.com',
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
            screenshotId: 'click-shot',
          },
        }),
      ),
    ).toBe('click-shot');
  });
});

describe('getStepScreenshotId / hasCustomStepScreenshot', () => {
  it('prefers custom screenshot id', () => {
    const step = makeStep({
      screenshotId: 'captured',
      customScreenshotId: 'custom',
      event: {
        id: '1',
        type: 'page-view',
        timestamp: 1,
        url: 'https://example.com',
        title: 'Home',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        screenshotId: 'event',
      },
    });

    expect(hasCustomStepScreenshot(step)).toBe(true);
    expect(getStepScreenshotId(step)).toBe('custom');
  });

  it('falls back to captured id when no custom', () => {
    const step = makeStep({
      screenshotId: 'captured',
      event: {
        id: '1',
        type: 'page-view',
        timestamp: 1,
        url: 'https://example.com',
        title: 'Home',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        screenshotId: 'event',
      },
    });

    expect(hasCustomStepScreenshot(step)).toBe(false);
    expect(getStepScreenshotId(step)).toBe('captured');
  });
});

describe('getStepScreenshotUrl', () => {
  it('resolves url from map or returns null', () => {
    const step = makeStep({
      screenshotId: 'shot-1',
      event: {
        id: '1',
        type: 'page-view',
        timestamp: 1,
        url: 'https://example.com',
        title: 'Home',
        viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
        screenshotId: 'shot-1',
      },
    });

    expect(getStepScreenshotUrl(step, { 'shot-1': 'https://cdn/s1.png' })).toBe(
      'https://cdn/s1.png',
    );
    expect(getStepScreenshotUrl(step, {})).toBeNull();

    const nav = makeStep({
      event: {
        id: '1',
        type: 'navigation',
        timestamp: 1,
        fromUrl: 'https://a.com',
        toUrl: 'https://b.com',
      },
    });
    expect(getStepScreenshotUrl(nav, { 'shot-1': 'https://cdn/s1.png' })).toBeNull();
  });
});
