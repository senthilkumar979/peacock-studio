import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PersonaAvatar } from './PersonaAvatar';

describe('PersonaAvatar', () => {
  it('renders decorative avatars for known genders', () => {
    const { container, rerender } = render(
      <PersonaAvatar persona={{ name: 'Ada', avatarId: 'female' }} size="sm" />,
    );
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
    expect(container.querySelector('svg')).toBeTruthy();

    rerender(<PersonaAvatar persona={{ name: 'Bob', avatarId: 'male' }} />);
    expect(container.querySelector('svg')).toBeTruthy();

    rerender(<PersonaAvatar persona={{ name: 'Sam', avatarId: 'neutral' }} size="lg" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
