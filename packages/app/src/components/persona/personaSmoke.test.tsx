import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Persona } from '@/types/persona';
import { CreatePersonaWithGoalDrawer } from './CreatePersonaWithGoalDrawer';
import { PersonaFormFields } from './PersonaFormFields';
import { PersonaFormDrawer } from './PersonaFormDrawer';
import { SwitchPersonaModal } from './SwitchPersonaModal';

const persona: Persona = {
  id: 'p1',
  name: 'Alex',
  occupation: 'PM',
  shortBio: 'Builds products',
  gender: 'neutral',
  avatarId: 'neutral-1',
  createdAt: 1,
  updatedAt: 1,
};

describe('persona smoke', () => {
  it('CreatePersonaWithGoalDrawer opens', () => {
    renderWithProviders(
      <CreatePersonaWithGoalDrawer isOpen onSave={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { name: /Create persona/i })).toBeInTheDocument();
  });

  it('PersonaFormFields shows name field', () => {
    renderWithProviders(
      <PersonaFormFields onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByLabelText(/^Name/i)).toBeInTheDocument();
  });

  it('PersonaFormDrawer opens in create mode', () => {
    renderWithProviders(
      <PersonaFormDrawer isOpen mode="create" onSave={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { name: 'Create persona' })).toBeInTheDocument();
  });

  it('SwitchPersonaModal lists personas', () => {
    renderWithProviders(
      <SwitchPersonaModal
        isOpen
        personas={[persona]}
        selectedPersonaId="p1"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });
});
