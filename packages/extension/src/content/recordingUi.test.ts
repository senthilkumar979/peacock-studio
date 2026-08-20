import { describe, expect, it, vi } from 'vitest';
import {
  hideRecordingUiForCapture,
  initRecordingUi,
  restoreRecordingUiAfterCapture,
  UI_HOST_ID,
  updateRecordingUi,
} from './recordingUi';

describe('recordingUi', () => {
  it('creates the host once and updates labels while recording', () => {
    const onStop = vi.fn();
    const onCapture = vi.fn();
    initRecordingUi(onStop, onCapture);
    initRecordingUi(onStop, onCapture);

    expect(document.querySelectorAll(`#${UI_HOST_ID}`)).toHaveLength(1);

    updateRecordingUi({ status: 'recording', eventCount: 5, startedAt: 1 });
    const host = document.getElementById(UI_HOST_ID)!;
    expect(host.style.display).toBe('block');
    expect(host.querySelector('[data-peacock-fab-count]')?.textContent).toBe('5');
    expect(host.querySelector('[data-peacock-status]')?.textContent).toBe(
      'Recording · 5 steps',
    );
  });

  it('hides when idle and supports capture hide/restore', () => {
    initRecordingUi(vi.fn(), vi.fn());
    updateRecordingUi({ status: 'recording', eventCount: 1, startedAt: 1 });

    hideRecordingUiForCapture();
    const host = document.getElementById(UI_HOST_ID)!;
    expect(host.style.display).toBe('none');

    updateRecordingUi({ status: 'recording', eventCount: 2, startedAt: 1 });
    expect(host.style.display).toBe('none');

    restoreRecordingUiAfterCapture({ status: 'paused', eventCount: 2, startedAt: 1 });
    expect(host.style.display).toBe('block');
    expect(host.querySelector('[data-peacock-status]')?.textContent).toBe('Paused · 2 steps');

    updateRecordingUi({ status: 'idle', eventCount: 0, startedAt: null });
    expect(host.style.display).toBe('none');
  });

  it('wires stop and capture actions', () => {
    const onStop = vi.fn();
    const onCapture = vi.fn();
    initRecordingUi(onStop, onCapture);
    updateRecordingUi({ status: 'recording', eventCount: 0, startedAt: 1 });

    const buttons = Array.from(
      document.querySelectorAll(`#${UI_HOST_ID} button`),
    ) as HTMLButtonElement[];
    const capture = buttons.find((button) => button.textContent === 'Capture Screenshot');
    const stop = buttons.find((button) => button.textContent === 'Stop');
    capture?.click();
    stop?.click();
    expect(onCapture).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
  });

  it('expands from the fab and collapses from the panel', () => {
    initRecordingUi(vi.fn(), vi.fn());
    updateRecordingUi({ status: 'recording', eventCount: 1, startedAt: 1 });

    const host = document.getElementById(UI_HOST_ID)!;
    const fab = host.querySelector('[data-peacock-fab]') as HTMLButtonElement;
    const panel = host.querySelector('[data-peacock-panel]') as HTMLDivElement;
    const collapse = host.querySelector('[data-peacock-collapse]') as HTMLButtonElement;

    expect(panel.hidden).toBe(true);
    fab.click();
    expect(panel.hidden).toBe(false);
    collapse.click();
    expect(panel.hidden).toBe(true);
  });
});
