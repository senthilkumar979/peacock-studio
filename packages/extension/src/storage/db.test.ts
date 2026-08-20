import { beforeEach, describe, expect, it } from 'vitest';
import type { FlowEvent, InputEvent, NavigationEvent } from '@peacock/shared';
import {
  addStoredEvent,
  clearRecordingData,
  db,
  deleteCaptureResult,
  getCaptureResult,
  getEventCount,
  getLatestStoredEvent,
  putStoredEvent,
  saveCaptureResult,
  storeEventWithCoalescing,
} from './db';

function makeInput(overrides: Partial<InputEvent> = {}): InputEvent {
  return {
    id: overrides.id ?? 'input-1',
    type: 'input',
    timestamp: overrides.timestamp ?? 100,
    url: 'https://example.com',
    title: 'Example',
    element: {
      tagName: 'INPUT',
      type: 'text',
      id: 'name',
      name: 'name',
      role: null,
      classes: [],
      selector: '#name',
      xpath: '//input',
      innerText: '',
      innerHTML: null,
      label: {
        text: 'Name',
        htmlFor: 'name',
        ariaLabel: null,
        ariaLabelledBy: null,
        placeholder: null,
      },
      valuePreview: overrides.valuePreview ?? 'a',
      classification: 'public',
      maskedValue: null,
      dataAttributes: {},
      ariaDescription: null,
      parent: null,
      grandparent: null,
      isButton: false,
      isLink: false,
      isInput: true,
      isSelect: false,
      isCheckbox: false,
      isRadio: false,
      isOption: false,
      isTab: false,
      isMenuItem: false,
      isCombobox: false,
      isContentEditable: false,
    },
    valuePreview: overrides.valuePreview ?? 'a',
    screenshotId: 'shot-1',
    ...overrides,
  };
}

function makeNavigation(overrides: Partial<NavigationEvent> = {}): NavigationEvent {
  return {
    id: overrides.id ?? 'nav-1',
    type: 'navigation',
    timestamp: overrides.timestamp ?? 50,
    fromUrl: 'https://example.com/a',
    toUrl: 'https://example.com/b',
    ...overrides,
  };
}

describe('storage/db', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('adds and counts events', async () => {
    await addStoredEvent(makeNavigation());
    expect(await getEventCount()).toBe(1);
    expect(await getLatestStoredEvent()).toMatchObject({ id: 'nav-1' });
  });

  it('puts and replaces an event by id', async () => {
    const first = makeNavigation({ id: 'nav-1', toUrl: '/one' });
    await addStoredEvent(first);
    await putStoredEvent(makeNavigation({ id: 'nav-1', toUrl: '/two', timestamp: 60 }));
    expect(await getEventCount()).toBe(1);
    expect(await getLatestStoredEvent()).toMatchObject({ toUrl: '/two' });
  });

  it('coalesces successive input events on the same field', async () => {
    const first = makeInput({ id: 'input-1', valuePreview: 'a', timestamp: 100 });
    const second = makeInput({ id: 'input-2', valuePreview: 'ab', timestamp: 120 });

    expect(await storeEventWithCoalescing(first)).toBe('added');
    expect(await storeEventWithCoalescing(second)).toBe('updated');
    expect(await getEventCount()).toBe(1);

    const latest = await getLatestStoredEvent();
    expect(latest?.type).toBe('input');
    if (latest?.type === 'input') {
      expect(latest.valuePreview).toBe('ab');
    }
  });

  it('adds non-coalescable events separately', async () => {
    await storeEventWithCoalescing(makeNavigation());
    await storeEventWithCoalescing(makeInput());
    expect(await getEventCount()).toBe(2);
  });

  it('clears recording events and screenshots', async () => {
    await addStoredEvent(makeNavigation() as FlowEvent);
    await db.screenshots.add({
      id: 'shot-1',
      blob: new Blob(['x']),
      tabId: 1,
      timestamp: 1,
    });

    await clearRecordingData();
    expect(await getEventCount()).toBe(0);
    expect(await db.screenshots.count()).toBe(0);
  });

  it('saves, loads, and deletes capture results', async () => {
    await saveCaptureResult({
      id: 'cap-1',
      blob: new Blob(['img'], { type: 'image/png' }),
      mode: 'visible',
      createdAt: 10,
    });

    const loaded = await getCaptureResult('cap-1');
    expect(loaded?.mode).toBe('visible');

    await deleteCaptureResult('cap-1');
    expect(await getCaptureResult('cap-1')).toBeUndefined();
  });

  it('returns null when no events exist', async () => {
    expect(await getLatestStoredEvent()).toBeNull();
  });

  it('opens the database when called while closed', async () => {
    await db.close();
    await addStoredEvent(makeNavigation());
    expect(await getEventCount()).toBe(1);
  });
});
