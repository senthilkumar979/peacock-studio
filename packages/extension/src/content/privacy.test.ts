import { describe, expect, it } from 'vitest';
import { isPeacockUiElement, isSensitiveUrl } from './privacy';
import { UI_HOST_ID } from './recordingUi';

describe('privacy', () => {
  it('detects sensitive URL path segments', () => {
    expect(isSensitiveUrl('https://app.test/login')).toBe(true);
    expect(isSensitiveUrl('https://app.test/payment/checkout')).toBe(true);
    expect(isSensitiveUrl('https://app.test/billing')).toBe(true);
    expect(isSensitiveUrl('https://app.test/docs')).toBe(false);
  });

  it('detects peacock UI host descendants', () => {
    const host = document.createElement('div');
    host.id = UI_HOST_ID;
    const child = document.createElement('button');
    host.appendChild(child);
    document.body.appendChild(host);

    expect(isPeacockUiElement(child)).toBe(true);
    expect(isPeacockUiElement(document.createElement('div'))).toBe(false);
    expect(isPeacockUiElement(null)).toBe(false);
  });
});
