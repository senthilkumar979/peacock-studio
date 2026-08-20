import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildAcquisitionUrl, ACQUISITION_UTM_CHANNELS } from './acquisition';
import {
  getFoundingUserInterest,
  hasFoundingUserInterest,
  markFoundingUserInterest,
} from './foundingUser';
import {
  FLOW_DOC_DEFAULT_VIEW,
  readFlowDocDefaultView,
  writeFlowDocDefaultView,
} from './flowDocViewPreferences';
import {
  getFlowMapsDetailPath,
  getPlaywrightTestsDetailPath,
  getSuperAdminPath,
  getTestCasesDetailPath,
  hasEmbedQueryParam,
  isEmbedPresentation,
  isEmbedSharePath,
} from './routes';
import {
  dismissGuestLibraryIntro,
  isGuestLibraryIntroDismissed,
} from './guestLibraryIntro';

describe('constants helpers', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('buildAcquisitionUrl', () => {
    const url = buildAcquisitionUrl(
      'https://peacockstudio.app/',
      ACQUISITION_UTM_CHANNELS.linkedin.source,
      ACQUISITION_UTM_CHANNELS.linkedin.medium,
      'launch',
      'hero',
    );
    expect(url).toContain('utm_source=linkedin');
    expect(url).toContain('utm_content=hero');
  });

  it('founding user interest storage', () => {
    expect(hasFoundingUserInterest()).toBe(false);
    markFoundingUserInterest('founder@example.com');
    expect(hasFoundingUserInterest()).toBe(true);
    expect(getFoundingUserInterest()?.email).toBe('founder@example.com');
  });

  it('flow doc default view storage', () => {
    expect(readFlowDocDefaultView()).toBe(FLOW_DOC_DEFAULT_VIEW);
    writeFlowDocDefaultView('player');
    expect(readFlowDocDefaultView()).toBe('player');
    localStorage.setItem('peacock-flow-doc-default-view', 'nope');
    expect(readFlowDocDefaultView()).toBe(FLOW_DOC_DEFAULT_VIEW);
  });

  it('route helpers', () => {
    expect(isEmbedSharePath('/s/abc/embed')).toBe(true);
    expect(isEmbedSharePath('/s/abc')).toBe(false);
    expect(isEmbedPresentation('/examples/kachabazar')).toBe(true);
    expect(hasEmbedQueryParam('?embed=true')).toBe(true);
    expect(hasEmbedQueryParam('embed=false')).toBe(false);
    expect(isEmbedPresentation('/dashboard', '?embed=true')).toBe(true);
    expect(getSuperAdminPath()).toBe('/super-admin');
    expect(getSuperAdminPath('health')).toBe('/super-admin?tab=health');
    expect(getTestCasesDetailPath('d1')).toBe('/test-cases/d1');
    expect(getPlaywrightTestsDetailPath('d1')).toBe('/playwright-tests/d1');
    expect(getFlowMapsDetailPath('d1')).toBe('/flow-maps/d1');
  });

  it('guest library intro dismiss helpers', () => {
    expect(isGuestLibraryIntroDismissed()).toBe(false);
    dismissGuestLibraryIntro();
    expect(isGuestLibraryIntroDismissed()).toBe(true);
  });
});

describe('observability components', () => {
  it('DeferredSentry is a no-op on marketing paths', async () => {
    vi.resetModules();
    const { DeferredSentry } = await import('@/observability/DeferredSentry');
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <DeferredSentry />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('VercelObservability is null outside production', async () => {
    const { VercelObservability } = await import('@/observability/VercelObservability');
    const { container } = render(<VercelObservability />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('sentry helpers', () => {
  it('classifies expected client noise', async () => {
    const { isExpectedClientNoise, isClerkSdkNoise } = await import('@/observability/sentry');
    expect(isExpectedClientNoise(new Error('ResizeObserver loop'))).toBe(true);
    expect(isExpectedClientNoise(new Error('Unexpected boom'))).toBe(false);
    expect(
      isClerkSdkNoise(
        Object.assign(new Error("Failed to execute 'json' on 'Response'"), {
          stack: 'at clerk.browser.js:1',
        }),
      ),
    ).toBe(true);
  });
});
