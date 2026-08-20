import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FlowStep } from '@peacock/shared';
import { StepResourceEditor } from './StepResourceEditor';
import { useFlowStore } from '@/store/flowStore';
import { fetchPageTitle } from '@/utils/fetchPageTitle';

vi.mock('@/utils/fetchPageTitle', () => ({
  fetchPageTitle: vi.fn(async () => 'Onboarding Guide'),
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

describe('StepResourceEditor', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(fetchPageTitle).mockClear();
    vi.mocked(fetchPageTitle).mockResolvedValue('Onboarding Guide');
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

  it('shows empty state and adds a valid resource', async () => {
    const user = userEvent.setup();
    render(<StepResourceEditor stepId="step-1" />);

    expect(screen.getByText(/no resources added yet/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText('https://example.com/resource');
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    await user.type(input, 'https://docs.example.com/guide');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.queryByText(/no resources added yet/i)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Onboarding Guide')).toBeInTheDocument();
    });
    expect(useFlowStore.getState().stepResources).toHaveLength(1);
    expect(useFlowStore.getState().stepResources[0]?.label).toBe('Onboarding Guide');
    expect(fetchPageTitle).toHaveBeenCalledWith('https://docs.example.com/guide');
    expect(input).toHaveValue('');
  });

  it('surfaces invalid URL errors from the store', async () => {
    const user = userEvent.setup();
    render(<StepResourceEditor stepId="step-1" />);

    await user.type(screen.getByPlaceholderText('https://example.com/resource'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText(/http or https/i)).toBeInTheDocument();
    expect(useFlowStore.getState().stepResources).toHaveLength(0);
  });

  it('updates and removes an existing resource', async () => {
    const user = userEvent.setup();
    useFlowStore.getState().addStepResource('step-1', 'https://example.com/old');
    render(<StepResourceEditor stepId="step-1" />);

    const edit = screen.getByDisplayValue('https://example.com/old');
    fireEvent.change(edit, { target: { value: 'https://example.com/new' } });
    expect(useFlowStore.getState().stepResources[0]?.url).toBe('https://example.com/new');

    await user.click(screen.getByRole('button', { name: 'Remove resource' }));
    expect(useFlowStore.getState().stepResources).toHaveLength(0);
    expect(screen.getByText(/no resources added yet/i)).toBeInTheDocument();
  });

  it('shows a generic error when update throws a non-Error', () => {
    useFlowStore.getState().addStepResource('step-1', 'https://example.com/old');
    const original = useFlowStore.getState().updateStepResource;
    useFlowStore.setState({
      updateStepResource: () => {
        throw 'nope';
      },
    });
    render(<StepResourceEditor stepId="step-1" />);
    fireEvent.change(screen.getByDisplayValue('https://example.com/old'), {
      target: { value: 'https://example.com/new' },
    });
    expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    useFlowStore.setState({ updateStepResource: original });
  });
});
