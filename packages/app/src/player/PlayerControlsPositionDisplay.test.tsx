import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerControlsPositionDisplay } from './PlayerControlsPositionDisplay';

describe('PlayerControlsPositionDisplay', () => {
  it('renders status as plain text', () => {
    render(
      <PlayerControlsPositionDisplay position={{ kind: 'status', title: 'Loading…' }} />,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders step number badge', () => {
    render(
      <PlayerControlsPositionDisplay
        position={{ kind: 'step', title: 'Save settings', stepNumber: 3 }}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Step')).toBeInTheDocument();
    expect(screen.getByText('Save settings')).toBeInTheDocument();
  });

  it('renders styled kinds with optional subtitle', () => {
    render(
      <PlayerControlsPositionDisplay
        position={{
          kind: 'path',
          title: 'Admin path',
          subtitle: 'Open console',
        }}
      />,
    );
    expect(screen.getByText('Path')).toBeInTheDocument();
    expect(screen.getByText('Admin path')).toBeInTheDocument();
    expect(screen.getByText('Open console')).toBeInTheDocument();
  });
});
