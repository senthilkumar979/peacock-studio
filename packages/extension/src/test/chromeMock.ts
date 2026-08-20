import { vi } from 'vitest';

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => void;

function createStorageArea() {
  const store = new Map<string, unknown>();

  return {
    store,
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
      if (keys == null) {
        return Object.fromEntries(store.entries());
      }
      if (typeof keys === 'string') {
        return { [keys]: store.get(keys) };
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        for (const key of keys) result[key] = store.get(key);
        return result;
      }
      const result: Record<string, unknown> = { ...keys };
      for (const key of Object.keys(keys)) {
        if (store.has(key)) result[key] = store.get(key);
      }
      return result;
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        store.set(key, value);
      }
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const list = Array.isArray(keys) ? keys : [keys];
      for (const key of list) store.delete(key);
    }),
    clear: vi.fn(async () => {
      store.clear();
    }),
  };
}

export function createChromeMock() {
  const session = createStorageArea();
  const local = createStorageArea();
  const onChangedListeners = new Set<StorageChangeListener>();

  let lastError: { message: string } | undefined;

  const chromeMock = {
    runtime: {
      get lastError() {
        return lastError;
      },
      setLastError(message: string | undefined) {
        lastError = message ? { message } : undefined;
      },
      sendMessage: vi.fn(),
      getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
      onMessage: {
        addListener: vi.fn(),
      },
    },
    storage: {
      session,
      local,
      onChanged: {
        addListener: vi.fn((listener: StorageChangeListener) => {
          onChangedListeners.add(listener);
        }),
        removeListener: vi.fn((listener: StorageChangeListener) => {
          onChangedListeners.delete(listener);
        }),
        emit(changes: Record<string, chrome.storage.StorageChange>, areaName: string) {
          for (const listener of onChangedListeners) listener(changes, areaName);
        },
      },
    },
    tabs: {
      sendMessage: vi.fn(),
      get: vi.fn(),
      query: vi.fn(),
      create: vi.fn(),
      captureVisibleTab: vi.fn(),
    },
    scripting: {
      executeScript: vi.fn(),
    },
  };

  return chromeMock;
}

export type ChromeMock = ReturnType<typeof createChromeMock>;

declare global {
  // eslint-disable-next-line no-var
  var __chromeMock: ChromeMock | undefined;
}

export function installChromeMock(): ChromeMock {
  const chromeMock = createChromeMock();
  globalThis.chrome = chromeMock as unknown as typeof chrome;
  globalThis.__chromeMock = chromeMock;
  return chromeMock;
}

export function resetChromeMockStores(): void {
  const mock = globalThis.__chromeMock;
  if (!mock) return;
  mock.storage.session.store.clear();
  mock.storage.local.store.clear();
  mock.runtime.setLastError(undefined);
  vi.clearAllMocks();
}
