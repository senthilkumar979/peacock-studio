import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerControls } from './PlayerControls';

describe('PlayerControls', () => {
  it('renders previous/play/next controls', () => {
    render(
      <PlayerControls
        position={{ kind: 'step', stepNumber: 1, title: 'Step 1' }}
        progressLabel="1 / 3"
        progressPercent={33}
        currentIndex={0}
        totalSegments={3}
        isPlaying={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onTogglePlay={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
