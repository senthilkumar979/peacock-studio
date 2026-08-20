import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setCloudInitError } from '@/cloud/authContext';
import { useCloudInitError, useCloudInitErrorDetail } from './useCloudInitError';

describe('useCloudInitError', () => {
  afterEach(() => {
    setCloudInitError(null);
  });

  it('returns null when there is no init error', () => {
    const { result } = renderHook(() => useCloudInitError());
    expect(result.current).toBeNull();
  });

  it('subscribes to cloud init error updates', () => {
    const { result } = renderHook(() => useCloudInitError());

    act(() => {
      setCloudInitError('Bootstrap failed');
    });
    expect(result.current).toBe('Bootstrap failed');

    act(() => {
      setCloudInitError(null);
    });
    expect(result.current).toBeNull();
  });

  it('exposes structured cloud init error detail', () => {
    const { result } = renderHook(() => useCloudInitErrorDetail());

    act(() => {
      setCloudInitError({
        kind: 'network_blocked',
        title: 'Company network may be blocking cloud sync',
        message: 'blocked',
        workarounds: ['Try hotspot'],
      });
    });

    expect(result.current).toMatchObject({
      kind: 'network_blocked',
      workarounds: ['Try hotspot'],
    });
  });
});
