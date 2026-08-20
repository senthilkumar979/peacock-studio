import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DASHBOARD_PATH, FLOW_DOCS_PATH } from '@/constants/routes';
import { useLibraryBackLink, useLibraryNavigationState } from './useLibraryBackState';

function createWrapper(initialEntry: string | { pathname: string; state?: unknown }) {
  const entry =
    typeof initialEntry === 'string'
      ? initialEntry
      : {
          pathname: initialEntry.pathname,
          state: initialEntry.state,
        };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  };
}

describe('useLibraryNavigationState', () => {
  it('returns flow docs back state on flow-docs path', () => {
    const { result } = renderHook(() => useLibraryNavigationState(), {
      wrapper: createWrapper(FLOW_DOCS_PATH),
    });
    expect(result.current).toEqual({ from: FLOW_DOCS_PATH, fromLabel: 'Flow Docs' });
  });

  it('returns dashboard back state on dashboard path', () => {
    const { result } = renderHook(() => useLibraryNavigationState(), {
      wrapper: createWrapper(DASHBOARD_PATH),
    });
    expect(result.current).toEqual({ from: DASHBOARD_PATH, fromLabel: 'Dashboard' });
  });

  it('resolves compare path from location state', () => {
    const { result } = renderHook(() => useLibraryNavigationState(), {
      wrapper: createWrapper({
        pathname: '/compare',
        state: { from: FLOW_DOCS_PATH, fromLabel: 'Flow Docs' },
      }),
    });
    expect(result.current.from).toBe(FLOW_DOCS_PATH);
    expect(result.current.fromLabel).toBe('Flow Docs');
  });

  it('defaults to dashboard for unknown paths', () => {
    const { result } = renderHook(() => useLibraryNavigationState(), {
      wrapper: createWrapper('/somewhere'),
    });
    expect(result.current.from).toBe(DASHBOARD_PATH);
  });
});

describe('useLibraryBackLink', () => {
  it('reads back link from location state', () => {
    const { result } = renderHook(() => useLibraryBackLink(), {
      wrapper: createWrapper({
        pathname: '/docs/1',
        state: { from: '/product-tours', fromLabel: 'Tours' },
      }),
    });
    expect(result.current).toEqual({ from: '/product-tours', fromLabel: 'Tours' });
  });

  it('falls back to dashboard when state is missing', () => {
    const { result } = renderHook(() => useLibraryBackLink(), {
      wrapper: createWrapper('/docs/1'),
    });
    expect(result.current.from).toBe(DASHBOARD_PATH);
  });
});
