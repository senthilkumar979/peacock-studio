import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkObservability } from './checkObservability';

vi.mock('@/analytics/config', () => ({
  isPostHogConfigured: vi.fn(() => false),
  isSentryConfigured: vi.fn(() => false),
}));

vi.mock('@/observability/sentry', () => ({
  isSentryInitialized: vi.fn(() => false),
}));

import { isPostHogConfigured, isSentryConfigured } from '@/analytics/config';
import { isSentryInitialized } from '@/observability/sentry';

describe('checkObservability', () => {
  beforeEach(() => {
    vi.mocked(isPostHogConfigured).mockReturnValue(false);
    vi.mocked(isSentryConfigured).mockReturnValue(false);
    vi.mocked(isSentryInitialized).mockReturnValue(false);
  });

  it('skips sentry and posthog when not configured', () => {
    const results = checkObservability();
    expect(results.find((r) => r.id === 'sentry')).toMatchObject({ status: 'skip' });
    expect(results.find((r) => r.id === 'posthog')).toMatchObject({ status: 'skip' });
    expect(results.find((r) => r.id === 'vercel-observability')?.status).toMatch(/pass|skip/);
  });

  it('warns when sentry DSN present but not initialized', () => {
    vi.mocked(isSentryConfigured).mockReturnValue(true);
    vi.mocked(isSentryInitialized).mockReturnValue(false);
    expect(checkObservability().find((r) => r.id === 'sentry')).toMatchObject({
      status: 'warn',
      detail: 'Sentry DSN present but not initialized yet.',
    });
  });

  it('passes when sentry is configured and initialized', () => {
    vi.mocked(isSentryConfigured).mockReturnValue(true);
    vi.mocked(isSentryInitialized).mockReturnValue(true);
    expect(checkObservability().find((r) => r.id === 'sentry')).toMatchObject({
      status: 'pass',
    });
  });

  it('passes posthog when configured', () => {
    vi.mocked(isPostHogConfigured).mockReturnValue(true);
    expect(checkObservability().find((r) => r.id === 'posthog')).toMatchObject({
      status: 'pass',
    });
  });
});
