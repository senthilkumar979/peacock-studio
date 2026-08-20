import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardEmptyState } from './DashboardEmptyState';

vi.mock('@/components/extension/ChromeWebStoreLink', () => ({
  ChromeWebStoreLink: ({ className }: { className?: string }) => (
    <a href="https://example.com/ext" className={className}>
      Install extension
    </a>
  ),
}));

vi.mock('@/components/onboarding/FirstTimeTooltip', () => ({
  FirstTimeTooltip: ({
    children,
    title,
    isOpen,
  }: {
    children: React.ReactNode;
    title: string;
    isOpen: boolean;
  }) => (
    <div>
      {children}
      {isOpen ? <span>{title}</span> : null}
    </div>
  ),
}));

describe('DashboardEmptyState', () => {
  it('renders onboarding copy for local storage', () => {
    render(<DashboardEmptyState />);
    expect(screen.getByText('Start your first documentation')).toBeInTheDocument();
    expect(screen.getByText(/stored securely on this device/i)).toBeInTheDocument();
    expect(screen.getByText('Install the extension')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Install extension' })).toBeInTheDocument();
  });

  it('uses cloud storage copy when requested', () => {
    render(<DashboardEmptyState storageHint="cloud" showRecordHint />);
    expect(screen.getByText(/synced to your workspace/i)).toBeInTheDocument();
    expect(screen.getByText('Record your first flow')).toBeInTheDocument();
  });
});
