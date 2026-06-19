import {
  ArrowRight,
  Eye,
  Keyboard,
  MousePointerClick,
  type LucideIcon,
} from 'lucide-react';
import type { FlowEvent } from '@peacock/shared';

export function getEventTypeLabel(type: FlowEvent['type']): string {
  switch (type) {
    case 'page-view':
      return 'Page view';
    case 'navigation':
      return 'Navigation';
    case 'click':
      return 'Click';
    case 'input':
      return 'Input';
    default: {
      const unknownType = type as string;
      return unknownType.charAt(0).toUpperCase() + unknownType.slice(1);
    }
  }
}

export function getEventTypeIcon(type: FlowEvent['type']): LucideIcon {
  switch (type) {
    case 'click':
      return MousePointerClick;
    case 'input':
      return Keyboard;
    case 'navigation':
      return ArrowRight;
    case 'page-view':
      return Eye;
    default:
      return MousePointerClick;
  }
}
