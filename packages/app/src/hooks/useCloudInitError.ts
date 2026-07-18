import { useSyncExternalStore } from 'react';
import {
  getCloudInitErrorSnapshot,
  subscribeCloudAuthContext,
} from '@/cloud/authContext';

export function useCloudInitError(): string | null {
  return useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudInitErrorSnapshot,
    () => null,
  );
}
