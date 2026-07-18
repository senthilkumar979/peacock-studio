import { useSyncExternalStore } from 'react';
import {
  getCloudInitErrorSnapshot,
  getCloudLibraryActiveSnapshot,
  subscribeCloudAuthContext,
} from '@/cloud/authContext';
import { isCloudSyncEnabled } from '@/cloud/config';

export function useCloudLibraryReady(): {
  isCloudMode: boolean;
  isReady: boolean;
  initError: string | null;
} {
  const isCloudMode = isCloudSyncEnabled();
  const isActive = useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudLibraryActiveSnapshot,
    () => false,
  );
  const initError = useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudInitErrorSnapshot,
    () => null,
  );

  return {
    isCloudMode,
    isReady: !isCloudMode || isActive,
    initError,
  };
}
