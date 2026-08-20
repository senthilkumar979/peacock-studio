import { describe, expect, it } from 'vitest';
import {
  ArrowRight,
  Eye,
  Keyboard,
  MousePointerClick,
  Send,
} from 'lucide-react';
import { getEventTypeIcon, getEventTypeLabel } from './eventTypeDisplay';

describe('getEventTypeLabel', () => {
  it('returns labels for known event types', () => {
    expect(getEventTypeLabel('page-view')).toBe('Page view');
    expect(getEventTypeLabel('navigation')).toBe('Navigation');
    expect(getEventTypeLabel('click')).toBe('Click');
    expect(getEventTypeLabel('input')).toBe('Input');
    expect(getEventTypeLabel('submit')).toBe('Submit');
  });

  it('capitalizes unknown types', () => {
    expect(getEventTypeLabel('scroll' as 'click')).toBe('Scroll');
  });
});

describe('getEventTypeIcon', () => {
  it('returns icons for known event types', () => {
    expect(getEventTypeIcon('click')).toBe(MousePointerClick);
    expect(getEventTypeIcon('input')).toBe(Keyboard);
    expect(getEventTypeIcon('submit')).toBe(Send);
    expect(getEventTypeIcon('navigation')).toBe(ArrowRight);
    expect(getEventTypeIcon('page-view')).toBe(Eye);
  });

  it('falls back to click icon for unknown types', () => {
    expect(getEventTypeIcon('scroll' as 'click')).toBe(MousePointerClick);
  });
});
