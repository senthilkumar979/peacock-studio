import { useSyncExternalStore } from 'react';
import {
  getCloudInitErrorDetailSnapshot,
  getCloudInitErrorSnapshot,
  subscribeCloudAuthContext,
} from '@/cloud/authContext';
import type { ClassifiedCloudInitError } from '@/cloud/cloudInitErrors';

export function useCloudInitError(): string | null {
  return useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudInitErrorSnapshot,
    () => null,
  );
}

export function useCloudInitErrorDetail(): ClassifiedCloudInitError | null {
  return useSyncExternalStore(
    subscribeCloudAuthContext,
    getCloudInitErrorDetailSnapshot,
    () => null,
  );
}
