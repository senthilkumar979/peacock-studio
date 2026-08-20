import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

vi.mock('@/analytics/analyticsClient', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('@/utils/appError', async () => {
  const actual = await vi.importActual<typeof import('@/utils/appError')>('@/utils/appError');
  return {
    ...actual,
    reportAppError: vi.fn(),
    logAppError: vi.fn(),
  };
});

import { gooeyToast } from 'goey-toast';
import { trackEvent } from '@/analytics/analyticsClient';
import { AnalyticsEvents } from '@/analytics/events';
import { logAppError, reportAppError } from '@/utils/appError';
import {
  notifyError,
  notifyInfo,
  notifyPersistError,
  notifyPromise,
  notifySuccess,
  notifyWarning,
} from './notify';

describe('notify helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notifySuccess / info / warning call gooeyToast', () => {
    notifySuccess('Saved', 'ok');
    notifyInfo('FYI', 'detail');
    notifyWarning('Careful', 'warn');

    expect(gooeyToast.success).toHaveBeenCalledWith(
      'Saved',
      expect.objectContaining({ description: 'ok' }),
    );
    expect(gooeyToast.info).toHaveBeenCalledWith(
      'FYI',
      expect.objectContaining({ description: 'detail' }),
    );
    expect(gooeyToast.warning).toHaveBeenCalledWith(
      'Careful',
      expect.objectContaining({ description: 'warn' }),
    );
  });

  it('notifyError with string tracks and toasts without classifying', () => {
    expect(notifyError('Nope', 'because')).toBeNull();
    expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.softErrorShown, {
      title: 'Nope',
      description: 'because',
    });
    expect(gooeyToast.error).toHaveBeenCalled();
  });

  it('notifyError with Error classifies and uses warning for soft validation', () => {
    const classified = notifyError(new Error('Document limit reached for this workspace'));
    expect(classified?.kind).toBe('validation');
    expect(gooeyToast.warning).toHaveBeenCalled();
    expect(logAppError).toHaveBeenCalled();
  });

  it('notifyPromise resolves, tracks success, and returns value', async () => {
    const value = await notifyPromise(Promise.resolve(42), {
      loading: 'Working…',
      success: 'Done',
      context: 'save',
    });
    expect(value).toBe(42);
    expect(trackEvent).toHaveBeenCalledWith(
      AnalyticsEvents.actionSucceeded,
      expect.objectContaining({ context: 'save' }),
    );
    expect(gooeyToast.promise).toHaveBeenCalled();
  });

  it('notifyPromise uses named event on success and tracks failure', async () => {
    await notifyPromise(Promise.resolve('ok'), {
      loading: '…',
      success: 'yes',
      event: 'doc_saved',
      eventProps: { id: '1' },
    });
    expect(trackEvent).toHaveBeenCalledWith('doc_saved', { id: '1' });

    await expect(
      notifyPromise(Promise.reject(new Error('boom')), {
        loading: '…',
        success: 'yes',
        event: 'doc_saved',
        error: 'Failed',
      }),
    ).rejects.toThrow('boom');
    expect(trackEvent).toHaveBeenCalledWith(
      AnalyticsEvents.actionFailed,
      expect.objectContaining({ event: 'doc_saved' }),
    );
  });

  it('notifyPromise error callback uses reportAppError and custom messages', async () => {
    const rejected = Promise.reject(new Error('x'));
    // Attach early so gooeyToast.promise error mapper can be exercised via mock
    vi.mocked(gooeyToast.promise).mockImplementation(((_p: any, opts: any) => {
      const errFn = opts?.error;
      if (typeof errFn === 'function') expect(errFn(new Error('x'))).toBe('custom');
      return undefined;
    }) as unknown as typeof gooeyToast.promise);

    await expect(
      notifyPromise(rejected, {
        loading: '…',
        success: 'ok',
        error: () => 'custom',
        context: 'ctx',
      }),
    ).rejects.toThrow('x');
    expect(reportAppError).toHaveBeenCalledWith('ctx', expect.any(Error));
  });
});

describe('notifyPersistError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('toasts once then cools down duplicate contexts', () => {
    notifyPersistError(new Error('a'), 'autosave');
    expect(gooeyToast.error).toHaveBeenCalledTimes(1);

    notifyPersistError(new Error('b'), 'autosave');
    expect(gooeyToast.error).toHaveBeenCalledTimes(1);
    expect(logAppError).toHaveBeenCalled();

    vi.setSystemTime(new Date('2026-01-01T00:00:09.000Z'));
    notifyPersistError(new Error('c'), 'autosave');
    expect(gooeyToast.error).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
