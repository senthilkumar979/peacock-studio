import { beforeEach, describe, expect, it, vi } from 'vitest';

const readAcquisitionContext = vi.fn();
const toAcquisitionTraits = vi.fn();

vi.mock('@/utils/acquisitionContext', () => ({
  readAcquisitionContext: (...args: any[]) => (readAcquisitionContext as any)(...args),
  toAcquisitionTraits: (...args: any[]) => (toAcquisitionTraits as any)(...args),
}));

import {
  disableAnalytics,
  enableAnalytics,
  flushAcquisitionToAnalytics,
  groupAnalytics,
  identifyAnalyticsUser,
  isAnalyticsEnabled,
  resetAnalyticsUser,
  setAnalyticsSink,
  trackDocumentFirstSaved,
  trackEvent,
  trackException,
  trackPageView,
} from './analyticsClient';
import { AnalyticsEvents } from './events';
import type { AnalyticsSink } from './types';

function createMockSink(): AnalyticsSink & {
  init: ReturnType<typeof vi.fn>;
  shutdown: ReturnType<typeof vi.fn>;
  track: ReturnType<typeof vi.fn>;
  page: ReturnType<typeof vi.fn>;
  captureException: ReturnType<typeof vi.fn>;
  identify: ReturnType<typeof vi.fn>;
  group: ReturnType<typeof vi.fn>;
  registerSuperProperties: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
} {
  return {
    init: vi.fn(),
    shutdown: vi.fn(),
    track: vi.fn(),
    page: vi.fn(),
    captureException: vi.fn(),
    identify: vi.fn(),
    group: vi.fn(),
    registerSuperProperties: vi.fn(),
    reset: vi.fn(),
  };
}

describe('analyticsClient', () => {
  let sink: ReturnType<typeof createMockSink>;

  beforeEach(() => {
    disableAnalytics();
    sink = createMockSink();
    setAnalyticsSink(sink);
    window.sessionStorage.clear();
    readAcquisitionContext.mockReset();
    toAcquisitionTraits.mockReset();
  });

  it('gates all emissions until enabled', () => {
    trackEvent('x');
    trackPageView('/a');
    trackException(new Error('e'));
    identifyAnalyticsUser('u1');
    groupAnalytics('organization', 'o1');
    resetAnalyticsUser();
    expect(sink.track).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it('initializes the sink once on enable and shuts down on disable', () => {
    enableAnalytics();
    enableAnalytics();
    expect(sink.init).toHaveBeenCalledTimes(1);
    expect(isAnalyticsEnabled()).toBe(true);

    trackEvent('hello', { n: 1 });
    trackPageView('/pricing');
    trackException(new Error('boom'), { code: 'x' });
    identifyAnalyticsUser('user-1', { plan: 'free' });
    groupAnalytics('organization', 'org-1', { name: 'Acme' });
    resetAnalyticsUser();

    expect(sink.track).toHaveBeenCalledWith('hello', { n: 1 });
    expect(sink.page).toHaveBeenCalledWith('/pricing');
    expect(sink.captureException).toHaveBeenCalled();
    expect(sink.identify).toHaveBeenCalledWith('user-1', { plan: 'free' });
    expect(sink.group).toHaveBeenCalledWith('organization', 'org-1', { name: 'Acme' });
    expect(sink.reset).toHaveBeenCalled();

    disableAnalytics();
    disableAnalytics();
    expect(sink.shutdown).toHaveBeenCalledTimes(1);
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it('flushes acquisition traits when present', () => {
    enableAnalytics();
    const traits = { acquisition_source: 'linkedin' };
    readAcquisitionContext.mockReturnValue(traits);
    toAcquisitionTraits.mockReturnValue(traits);

    flushAcquisitionToAnalytics();

    expect(sink.registerSuperProperties).toHaveBeenCalledWith(traits);
    expect(sink.track).toHaveBeenCalledWith(
      AnalyticsEvents.acquisitionContextCaptured,
      traits,
    );
  });

  it('skips acquisition flush when traits are empty', () => {
    enableAnalytics();
    readAcquisitionContext.mockReturnValue(null);
    toAcquisitionTraits.mockReturnValue({});

    flushAcquisitionToAnalytics();
    expect(sink.registerSuperProperties).not.toHaveBeenCalled();
    expect(sink.track).not.toHaveBeenCalled();
  });

  it('emits document_first_saved once per document per session', () => {
    enableAnalytics();
    trackDocumentFirstSaved('doc-1', { source: 'editor' });
    trackDocumentFirstSaved('doc-1');
    trackDocumentFirstSaved('doc-2');
    trackDocumentFirstSaved('');

    expect(sink.track).toHaveBeenCalledTimes(2);
    expect(sink.track).toHaveBeenNthCalledWith(1, AnalyticsEvents.documentFirstSaved, {
      document_id: 'doc-1',
      source: 'editor',
    });
    expect(sink.track).toHaveBeenNthCalledWith(2, AnalyticsEvents.documentFirstSaved, {
      document_id: 'doc-2',
    });
  });
});
