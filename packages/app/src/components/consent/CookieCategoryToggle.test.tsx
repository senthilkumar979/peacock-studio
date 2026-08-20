import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieCategoryToggle } from './CookieCategoryToggle';
import type { ConsentCategoryMeta } from '@peacock/shared';

const analyticsCategory: ConsentCategoryMeta = {
  id: 'analytics',
  label: 'Analytics',
  description: 'Usage metrics',
  required: false,
};

const necessaryCategory: ConsentCategoryMeta = {
  id: 'necessary',
  label: 'Strictly necessary',
  description: 'Always on',
  required: true,
};

describe('CookieCategoryToggle', () => {
  it('toggles optional categories', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CookieCategoryToggle category={analyticsCategory} enabled={false} onChange={onChange} />,
    );

    await user.click(screen.getByRole('switch', { name: 'Analytics' }));
    expect(onChange).toHaveBeenCalledWith('analytics', true);
  });

  it('locks required categories', () => {
    const onChange = vi.fn();
    render(
      <CookieCategoryToggle category={necessaryCategory} enabled onChange={onChange} />,
    );
    expect(screen.getByRole('switch', { name: /Strictly necessary \(always on\)/i })).toBeDisabled();
  });
});
