import { describe, expect, it } from 'vitest';
import {
  formatFabAriaLabel,
  formatFabCount,
  formatRecordingStatus,
} from './recordingUiLabels';

describe('recordingUiLabels', () => {
  it('formats fab count', () => {
    expect(formatFabCount(0)).toBe('0');
    expect(formatFabCount(12)).toBe('12');
  });

  it('formats recording and paused status labels', () => {
    expect(
      formatRecordingStatus({ status: 'recording', eventCount: 3, startedAt: 1 }),
    ).toBe('Recording · 3 steps');
    expect(
      formatRecordingStatus({ status: 'paused', eventCount: 1, startedAt: 1 }),
    ).toBe('Paused · 1 steps');
  });

  it('formats aria labels', () => {
    expect(
      formatFabAriaLabel({ status: 'recording', eventCount: 2, startedAt: 1 }),
    ).toBe('Recording: 2 steps captured');
    expect(
      formatFabAriaLabel({ status: 'paused', eventCount: 0, startedAt: 1 }),
    ).toBe('Paused: 0 steps captured');
  });
});
