import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FlowStep } from '@peacock/shared';
import { useFlowStore } from '@/store/flowStore';
import { fetchPageTitle } from '@/utils/fetchPageTitle';
import { hydrateResourceLabel } from './hydrateResourceLabel';

vi.mock('@/utils/fetchPageTitle', () => ({
  fetchPageTitle: vi.fn(async () => 'Project Dashboard'),
}));

function makeStep(id: string): FlowStep {
  return {
    id,
    title: id,
    notes: '',
    generatedTitle: id,
    generatedDescription: '',
    screenshotId: `${id}-shot`,
    event: {
      id: `${id}-ev`,
      type: 'page-view',
      timestamp: 1,
      url: 'https://example.com',
      title: 'Page',
      viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
      screenshotId: `${id}-shot`,
    },
  };
}

describe('hydrateResourceLabel', () => {
  beforeEach(() => {
    vi.mocked(fetchPageTitle).mockClear();
    vi.mocked(fetchPageTitle).mockResolvedValue('Project Dashboard');
    useFlowStore.getState().resetFlow();
    const step = makeStep('step-1');
    useFlowStore.getState().hydrateFromDocument({
      id: 'doc-1',
      savedAt: 1,
      updatedAt: 1,
      status: 'draft',
      flow: {
        flow: {
          title: 'Doc',
          description: '',
          version: '1.0.0',
          category: 'general',
          tags: [],
        },
        metadata: {
          createdAt: 1,
          browser: 'test',
          platform: 'test',
          screen: { width: 1, height: 1 },
        },
        steps: [step],
      },
      steps: [step],
      screenshotUrls: {},
      stepResources: [],
    });
  });

  it('stores the fetched page title on an unlabeled resource', async () => {
    const id = useFlowStore.getState().addStepResource('step-1', 'https://example.com/dashboard');
    if (!id) throw new Error('expected resource id');
    await expect(hydrateResourceLabel(id, 'https://example.com/dashboard')).resolves.toBe(true);
    expect(useFlowStore.getState().stepResources[0]?.label).toBe('Project Dashboard');
  });

  it('skips fetch when a label is already present', async () => {
    const id = useFlowStore.getState().addStepResource('step-1', 'https://example.com/dashboard');
    if (!id) throw new Error('expected resource id');
    useFlowStore.getState().setStepResourceLabel(id, 'Existing');
    await expect(hydrateResourceLabel(id, 'https://example.com/dashboard')).resolves.toBe(false);
    expect(fetchPageTitle).not.toHaveBeenCalled();
  });
});
