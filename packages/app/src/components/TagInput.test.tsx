import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('adds kebab-case tags and removes them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagInput tags={['alpha']} suggestions={['beta', 'gamma']} onChange={onChange} />,
    );

    expect(screen.getByText('alpha')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove tag alpha' }));
    expect(onChange).toHaveBeenCalledWith([]);

    await user.type(screen.getByPlaceholderText(/add a tag/i), 'updated admin flow{Enter}');
    expect(onChange).toHaveBeenCalledWith(['alpha', 'updated-admin-flow']);
  });

  it('rejects tags that start with a number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput tags={['alpha']} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/add a tag/i), '123-admin{Enter}');
    expect(screen.getByText(/start with a letter/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects tags longer than 30 characters after formatting', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/add a tag/i), `${'long word '.repeat(5)}{Enter}`);
    expect(screen.getByText(/at most 30 characters/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables input at the five-tag limit', () => {
    render(
      <TagInput tags={['one', 'two', 'three', 'four', 'five']} onChange={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText(/maximum of 5 tags/i)).toBeDisabled();
  });
});
