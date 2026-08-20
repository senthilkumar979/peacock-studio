import { describe, expect, it } from 'vitest';
import { DASHBOARD_PATH, EXTENSION_INSTALL_PATH } from '@/constants/routes';
import { getExtensionGatePath, isSafeAppPath, readExtensionGateNext } from './extensionGate';

describe('isSafeAppPath', () => {
  it('accepts absolute app paths only', () => {
    expect(isSafeAppPath('/dashboard')).toBe(true);
    expect(isSafeAppPath('/docs/1?view=hub')).toBe(true);
    expect(isSafeAppPath('//evil.com')).toBe(false);
    expect(isSafeAppPath('https://evil.com')).toBe(false);
    expect(isSafeAppPath('dashboard')).toBe(false);
  });
});

describe('getExtensionGatePath', () => {
  it('defaults next to dashboard', () => {
    expect(getExtensionGatePath()).toBe(
      `${EXTENSION_INSTALL_PATH}?${new URLSearchParams({ next: DASHBOARD_PATH })}`,
    );
  });

  it('keeps safe next and replaces unsafe next with dashboard', () => {
    expect(getExtensionGatePath('/flow-docs')).toContain('next=%2Fflow-docs');
    expect(getExtensionGatePath('https://evil.com')).toContain(
      `next=${encodeURIComponent(DASHBOARD_PATH)}`,
    );
  });
});

describe('readExtensionGateNext', () => {
  it('returns next when safe, otherwise fallback', () => {
    expect(readExtensionGateNext('?next=/docs/1')).toBe('/docs/1');
    expect(readExtensionGateNext('?next=//evil')).toBe(DASHBOARD_PATH);
    const readNext = readExtensionGateNext as (search: string, fallback?: string) => string;
    expect(readNext('', '/docs/1')).toBe('/docs/1');
  });
});
