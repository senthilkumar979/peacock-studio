import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkCloudConfig,
  checkExtension,
  checkIndexedDb,
  checkSession,
} from './checkConnections';

vi.mock('@/cloud/config', () => ({
  getCloudSyncMissingConfigMessage: vi.fn(() => null),
  isCloudSyncFlagEnabled: vi.fn(() => false),
}));

vi.mock('@/cloud/validateCloudEnv', () => ({
  getCloudEnvValidationError: vi.fn(() => null),
}));

vi.mock('@/cloud/authContext', () => ({
  isCloudLibraryActive: vi.fn(() => false),
}));

vi.mock('@/cloud/sessionState', () => ({
  getSessionModeSnapshot: vi.fn(() => 'guest'),
}));

vi.mock('@/storage/flowLibraryDb', () => ({
  listFlowSummaries: vi.fn(),
}));

vi.mock('@/utils/probeExtensionInstalled', () => ({
  probeExtensionInstalled: vi.fn(),
}));

import {
  getCloudSyncMissingConfigMessage,
  isCloudSyncFlagEnabled,
} from '@/cloud/config';
import { getCloudEnvValidationError } from '@/cloud/validateCloudEnv';
import { isCloudLibraryActive } from '@/cloud/authContext';
import { getSessionModeSnapshot } from '@/cloud/sessionState';
import { listFlowSummaries } from '@/storage/flowLibraryDb';
import { probeExtensionInstalled } from '@/utils/probeExtensionInstalled';

describe('checkIndexedDb', () => {
  beforeEach(() => {
    vi.mocked(listFlowSummaries).mockReset();
  });

  it('passes with local doc count', async () => {
    vi.mocked(listFlowSummaries).mockResolvedValue([{ id: 'a' }, { id: 'b' }] as never);
    await expect(checkIndexedDb()).resolves.toMatchObject({
      id: 'indexeddb',
      status: 'pass',
      detail: expect.stringContaining('2 local flow doc'),
    });
  });

  it('fails when library open throws', async () => {
    vi.mocked(listFlowSummaries).mockRejectedValue(new Error('quota'));
    await expect(checkIndexedDb()).resolves.toMatchObject({
      status: 'fail',
      detail: expect.stringContaining('quota'),
    });
  });
});

describe('checkExtension', () => {
  it('passes when probe finds extension', async () => {
    vi.mocked(probeExtensionInstalled).mockResolvedValue(true);
    await expect(checkExtension()).resolves.toMatchObject({ status: 'pass' });
  });

  it('warns when extension missing', async () => {
    vi.mocked(probeExtensionInstalled).mockResolvedValue(false);
    await expect(checkExtension()).resolves.toMatchObject({ status: 'warn' });
  });
});

describe('checkCloudConfig', () => {
  beforeEach(() => {
    vi.mocked(isCloudSyncFlagEnabled).mockReturnValue(false);
    vi.mocked(getCloudSyncMissingConfigMessage).mockReturnValue(null);
    vi.mocked(getCloudEnvValidationError).mockReturnValue(null);
  });

  it('skips when cloud sync flag is off', () => {
    expect(checkCloudConfig()).toMatchObject({ status: 'skip' });
  });

  it('fails on missing config', () => {
    vi.mocked(isCloudSyncFlagEnabled).mockReturnValue(true);
    vi.mocked(getCloudSyncMissingConfigMessage).mockReturnValue('Missing Clerk key');
    expect(checkCloudConfig()).toMatchObject({
      status: 'fail',
      detail: 'Missing Clerk key',
    });
  });

  it('fails on env validation error', () => {
    vi.mocked(isCloudSyncFlagEnabled).mockReturnValue(true);
    vi.mocked(getCloudEnvValidationError).mockReturnValue('Bad URL');
    expect(checkCloudConfig()).toMatchObject({ status: 'fail', detail: 'Bad URL' });
  });

  it('passes when config looks valid', () => {
    vi.mocked(isCloudSyncFlagEnabled).mockReturnValue(true);
    expect(checkCloudConfig()).toMatchObject({ status: 'pass' });
  });
});

describe('checkSession', () => {
  beforeEach(() => {
    vi.mocked(isCloudLibraryActive).mockReturnValue(false);
  });

  it.each([
    ['local', 'pass'],
    ['loading', 'warn'],
    ['guest', 'pass'],
    ['connecting', 'warn'],
    ['onboarding', 'warn'],
  ] as const)('maps %s to %s', (mode, status) => {
    vi.mocked(getSessionModeSnapshot).mockReturnValue(mode);
    expect(checkSession()).toMatchObject({ id: 'session', status });
  });

  it('reports cloud with active library', () => {
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    vi.mocked(isCloudLibraryActive).mockReturnValue(true);
    expect(checkSession()).toMatchObject({
      status: 'pass',
      detail: 'Cloud library active.',
    });
  });

  it('reports cloud without active library', () => {
    vi.mocked(getSessionModeSnapshot).mockReturnValue('cloud');
    expect(checkSession().detail).toContain('without an active organization');
  });

  it('warns on unknown mode', () => {
    vi.mocked(getSessionModeSnapshot).mockReturnValue('weird' as never);
    expect(checkSession()).toMatchObject({
      status: 'warn',
      detail: 'Unknown session mode: weird',
    });
  });
});
