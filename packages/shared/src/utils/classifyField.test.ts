import { describe, expect, it } from 'vitest';
import { extractElementSnapshot } from './extractElementSnapshot';
import { resolveDisplayValue } from './classifyField';

function snapshotFor(html: string) {
  document.body.innerHTML = html;
  const el = document.body.firstElementChild as HTMLElement;
  return extractElementSnapshot(el);
}

describe('classification via extractElementSnapshot', () => {
  it('classifies password fields as secret and drops the value', () => {
    const snapshot = snapshotFor('<input type="password" name="pwd" value="hunter2" />');
    expect(snapshot.classification).toBe('secret');
    expect(snapshot.valuePreview).toBeNull();
    expect(snapshot.maskedValue).toBeNull();
  });

  it('classifies credit card fields as secret', () => {
    const snapshot = snapshotFor('<input type="text" name="creditCard" value="4111111111111111" />');
    expect(snapshot.classification).toBe('secret');
    expect(snapshot.valuePreview).toBeNull();
  });

  it('classifies api token fields as secret', () => {
    const snapshot = snapshotFor('<input type="text" name="api_key" value="sk-abc123" />');
    expect(snapshot.classification).toBe('secret');
    expect(snapshot.valuePreview).toBeNull();
  });

  it('classifies otp fields as secret', () => {
    const snapshot = snapshotFor('<input type="text" name="otp" value="123456" />');
    expect(snapshot.classification).toBe('secret');
    expect(snapshot.valuePreview).toBeNull();
  });

  it('classifies email fields as sensitive with a masked preview', () => {
    const snapshot = snapshotFor('<input type="email" name="email" value="jane@example.com" />');
    expect(snapshot.classification).toBe('sensitive');
    expect(snapshot.valuePreview).toBe('jane@example.com');
    expect(snapshot.maskedValue).toBe('jan***');
  });

  it('classifies passport fields as sensitive', () => {
    const snapshot = snapshotFor('<input type="text" name="passport" value="X1234567" />');
    expect(snapshot.classification).toBe('sensitive');
    expect(snapshot.maskedValue).toBe('X12***');
  });

  it('classifies ordinary text fields as public', () => {
    const snapshot = snapshotFor('<input type="text" name="firstName" value="Jonathan" />');
    expect(snapshot.classification).toBe('public');
    expect(snapshot.valuePreview).toBe('Jonathan');
    expect(snapshot.maskedValue).toBeNull();
  });
});

describe('resolveDisplayValue', () => {
  it('returns secret placeholder for secrets', () => {
    expect(resolveDisplayValue('secret', 'x', 'y', '••••')).toBe('••••');
  });

  it('prefers masked value for sensitive fields', () => {
    expect(resolveDisplayValue('sensitive', 'jane@x.com', 'jan***', '••••')).toBe('jan***');
    expect(resolveDisplayValue('sensitive', 'jane@x.com', null, '••••')).toBe('jane@x.com');
  });

  it('returns preview for public and internal', () => {
    expect(resolveDisplayValue('public', 'hello', null, '••••')).toBe('hello');
    expect(resolveDisplayValue('internal', 'hello', null, '••••')).toBe('hello');
  });
});
