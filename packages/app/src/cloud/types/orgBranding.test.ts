import { describe, expect, it } from 'vitest';
import { resolveOrgBranding } from './orgBranding';
import { BRAND_COLORS, PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';

describe('resolveOrgBranding', () => {
  it('falls back to Peacock defaults', () => {
    expect(resolveOrgBranding(null)).toEqual({
      logoUrl: PEACOCK_LOGO_SRC,
      primaryColor: BRAND_COLORS.primary,
      appName: PEACOCK_APP_NAME,
    });
  });

  it('prefers direct fields then nested metadata branding', () => {
    expect(
      resolveOrgBranding({
        logoUrl: ' https://logo ',
        metadata: { branding: { primaryColor: '#111111' } },
      }),
    ).toEqual({
      logoUrl: 'https://logo',
      primaryColor: '#111111',
      appName: PEACOCK_APP_NAME,
    });

    expect(
      resolveOrgBranding({
        metadata: { logoUrl: '/a.png', primaryColor: '#222' },
      }),
    ).toMatchObject({ logoUrl: '/a.png', primaryColor: '#222' });
  });
});
