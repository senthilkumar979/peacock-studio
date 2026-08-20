import { beforeEach, describe, expect, it, vi } from 'vitest';

const { posthog, getPostHogKey, getPostHogHost, registerPostHogFeatureFlagReader } =
  vi.hoisted(() => {
    const posthogMock = {
      init: vi.fn(),
      startExceptionAutocapture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
      isFeatureEnabled: vi.fn(),
      onFeatureFlags: vi.fn(),
      reset: vi.fn(),
      capture: vi.fn(),
      captureException: vi.fn(),
      identify: vi.fn(),
      group: vi.fn(),
    };
    return {
      posthog: posthogMock,
      getPostHogKey: vi.fn(),
      getPostHogHost: vi.fn(),
      registerPostHogFeatureFlagReader: vi.fn(),
    };
  });

vi.mock('posthog-js', () => ({
  default: posthog,
}));

vi.mock('./config', () => ({
  getPostHogKey: (...args: any[]) => (getPostHogKey as any)(...args),
  getPostHogHost: (...args: any[]) => (getPostHogHost as any)(...args),
}));

vi.mock('./featureFlags', () => ({
  registerPostHogFeatureFlagReader: (...args: any[]) =>
    registerPostHogFeatureFlagReader(...args),
}));

import { createPostHogSink, identifyUser } from './posthogSink';

describe('createPostHogSink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPostHogHost.mockReturnValue('https://eu.i.posthog.com');
  });

  it('no-ops init without a PostHog key', () => {
    getPostHogKey.mockReturnValue(undefined);
    const sink = createPostHogSink();
    sink.init();
    sink.track('evt');
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('initializes PostHog once and forwards sink methods', () => {
    getPostHogKey.mockReturnValue('phc_test');
    posthog.onFeatureFlags.mockImplementation((cb: () => void) => cb());
    posthog.isFeatureEnabled.mockReturnValue(true);

    const sink = createPostHogSink();
    sink.init();
    sink.init();

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://eu.i.posthog.com',
        capture_pageview: false,
        capture_exceptions: true,
      }),
    );
    expect(posthog.startExceptionAutocapture).toHaveBeenCalled();
    expect(registerPostHogFeatureFlagReader).toHaveBeenCalled();

    sink.track('clicked', { id: 1 });
    sink.page('/dashboard');
    sink.captureException?.(new Error('real'));
    sink.identify?.('user-1', { plan: 'free' });
    sink.group?.('organization', 'org-1');
    sink.registerSuperProperties?.({ source: 'ads' });
    sink.reset?.();

    expect(posthog.capture).toHaveBeenCalledWith('clicked', { id: 1 });
    expect(posthog.capture).toHaveBeenCalledWith(
      '$pageview',
      expect.objectContaining({ path: '/dashboard' }),
    );
    expect(posthog.captureException).toHaveBeenCalled();
    expect(posthog.identify).toHaveBeenCalledWith('user-1', { plan: 'free' });
    expect(posthog.group).toHaveBeenCalledWith('organization', 'org-1', undefined);
    expect(posthog.register_once).toHaveBeenCalledWith({ source: 'ads' });
    expect(posthog.reset).toHaveBeenCalled();

    sink.shutdown();
    expect(registerPostHogFeatureFlagReader).toHaveBeenCalledWith(null);
  });

  it('drops benign exceptions in before_send and captureException', () => {
    getPostHogKey.mockReturnValue('phc_test');
    const sink = createPostHogSink();
    sink.init();

    const initOptions = posthog.init.mock.calls[0]?.[1] as {
      before_send: (event: {
        event: string;
        properties?: Record<string, unknown>;
      } | null) => unknown;
    };

    expect(
      initOptions.before_send({
        event: '$exception',
        properties: { $exception_message: 'ResizeObserver loop limit exceeded' },
      }),
    ).toBeNull();
    expect(
      initOptions.before_send({
        event: '$exception',
        properties: { message: 'Failed to save' },
      }),
    ).toEqual(
      expect.objectContaining({
        event: '$exception',
      }),
    );

    sink.captureException?.(new Error('ResizeObserver loop limit exceeded'));
    expect(posthog.captureException).not.toHaveBeenCalled();
  });
});

describe('identifyUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies only when PostHog is configured', () => {
    getPostHogKey.mockReturnValue(undefined);
    identifyUser('u1');
    expect(posthog.identify).not.toHaveBeenCalled();

    getPostHogKey.mockReturnValue('phc_test');
    identifyUser('u2', { role: 'admin' });
    expect(posthog.identify).toHaveBeenCalledWith('u2', { role: 'admin' });
  });
});
