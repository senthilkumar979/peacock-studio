import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ClickEvent,
  FlowCaptureEnvironment,
  NavigationEvent,
  PageViewEvent,
} from '@peacock/shared';
import { db } from '../storage/db';

vi.mock('../background/captureSession', () => ({
  getFinalCaptureEnvironment: vi.fn(),
}));

vi.mock('./blobToDataUrl', () => ({
  blobToDataUrl: vi.fn(async () => 'data:image/png;base64,dGVzdA=='),
}));

import { getFinalCaptureEnvironment } from '../background/captureSession';
import { buildPayloadFromRecording } from './payload';

const mockedGetFinalCaptureEnvironment = vi.mocked(getFinalCaptureEnvironment);

function baseElement() {
  return {
    tagName: 'BUTTON',
    type: 'button',
    id: 'go',
    name: null,
    role: 'button',
    classes: [],
    selector: '#go',
    xpath: '//button',
    innerText: 'Go',
    innerHTML: null,
    label: {
      text: null,
      htmlFor: null,
      ariaLabel: null,
      ariaLabelledBy: null,
      placeholder: null,
    },
    valuePreview: null,
    classification: 'public' as const,
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
  };
}

function makeEnv(): FlowCaptureEnvironment {
  return {
    userAgent: 'test-agent',
    locale: 'en-US',
    languages: ['en-US'],
    timezone: 'UTC',
    platform: 'MacIntel',
    os: { family: 'macos', name: 'macOS', version: '14' },
    browser: { family: 'chrome', name: 'Chrome', version: '120' },
    device: { category: 'desktop', type: 'desktop' },
    screen: {
      width: 1440,
      height: 900,
      availWidth: 1440,
      availHeight: 880,
      devicePixelRatio: 2,
    },
    viewport: { width: 1200, height: 800 },
    recordingStartedAt: 1000,
    recordingEndedAt: 2000,
    durationMs: 1000,
  };
}

describe('buildPayloadFromRecording', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    mockedGetFinalCaptureEnvironment.mockReset();
    mockedGetFinalCaptureEnvironment.mockResolvedValue(null);
  });

  it('builds untitled payload when there are no events', async () => {
    const handoff = await buildPayloadFromRecording();
    expect(handoff.payload.flow.title).toBe('Untitled Flow');
    expect(handoff.payload.steps).toEqual([]);
    expect(handoff.payload.metadata.browser).toBe('');
    expect(handoff.screenshotUrls).toEqual({});
  });

  it('titles from navigation and includes capture environment metadata', async () => {
    const navigation: NavigationEvent = {
      id: 'nav-1',
      type: 'navigation',
      timestamp: 10,
      fromUrl: 'https://a.test',
      toUrl: 'https://b.test',
    };
    await db.events.add({ id: navigation.id, data: navigation, timestamp: navigation.timestamp });

    const env = makeEnv();
    mockedGetFinalCaptureEnvironment.mockResolvedValue(env);

    const handoff = await buildPayloadFromRecording();
    expect(handoff.payload.flow.title).toBe('Recorded Flow');
    expect(handoff.payload.metadata.captureEnvironment).toEqual(env);
    expect(handoff.payload.metadata.browser).toBe(env.userAgent);
    expect(handoff.payload.metadata.createdAt).toBe(env.recordingStartedAt);
  });

  it('uses first event title and maps screenshot ids', async () => {
    const click: ClickEvent = {
      id: 'click-1',
      type: 'click',
      timestamp: 20,
      url: 'https://example.com',
      title: 'Checkout',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 1, y: 2, xPercent: 1, yPercent: 2 },
      element: baseElement(),
      screenshotId: 'shot-1',
    };
    const pageView: PageViewEvent = {
      id: 'pv-1',
      type: 'page-view',
      timestamp: 30,
      url: 'https://example.com/done',
      title: 'Done',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: 'shot-2',
    };

    await db.events.bulkAdd([
      { id: click.id, data: click, timestamp: click.timestamp },
      { id: pageView.id, data: pageView, timestamp: pageView.timestamp },
    ]);
    await db.screenshots.add({
      id: 'shot-1',
      blob: new Blob(['img'], { type: 'image/png' }),
      tabId: 1,
      timestamp: 20,
    });

    const handoff = await buildPayloadFromRecording();
    expect(handoff.payload.flow.title).toBe('Checkout');
    expect(handoff.payload.steps).toHaveLength(2);
    const firstStep = handoff.payload.steps[0];
    const secondStep = handoff.payload.steps[1];
    expect(firstStep && 'screenshotId' in firstStep ? firstStep.screenshotId : null).toBe('shot-1');
    expect(secondStep && 'screenshotId' in secondStep ? secondStep.screenshotId : null).toBe('shot-2');
    expect(handoff.screenshotUrls['shot-1']).toBe('data:image/png;base64,dGVzdA==');
  });

  it('uses untitled flow when the first event has no title', async () => {
    const click: ClickEvent = {
      id: 'click-1',
      type: 'click',
      timestamp: 20,
      url: 'https://example.com',
      title: '',
      viewport: { width: 100, height: 100, scrollX: 0, scrollY: 0, dpr: 1 },
      position: { x: 1, y: 2, xPercent: 1, yPercent: 2 },
      element: baseElement(),
      screenshotId: 'shot-1',
    };
    await db.events.add({ id: click.id, data: click, timestamp: click.timestamp });
    const handoff = await buildPayloadFromRecording();
    expect(handoff.payload.flow.title).toBe('Untitled Flow');
  });
});
