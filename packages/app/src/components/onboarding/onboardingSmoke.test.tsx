import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FirstCaptureChecklist } from './FirstCaptureChecklist';
import { PendingCaptureBar } from './PendingCaptureBar';

describe('onboarding smoke', () => {
  it('FirstCaptureChecklist shows dismiss', () => {
    renderWithProviders(<FirstCaptureChecklist onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Dismiss checklist' })).toBeInTheDocument();
  });

  it('PendingCaptureBar shows save', () => {
    renderWithProviders(
      <PendingCaptureBar isSaving={false} onSave={vi.fn()} onDiscard={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Save to library' })).toBeInTheDocument();
  });
});
