import type { FlowEvent, InputEvent } from '../types/events';

export function shouldCoalesceInputEvents(
  previous: FlowEvent | null,
  incoming: FlowEvent,
): previous is InputEvent {
  if (!previous || previous.type !== 'input' || incoming.type !== 'input') {
    return false;
  }

  return (
    previous.url === incoming.url &&
    previous.element.selector === incoming.element.selector
  );
}

export function mergeCoalescedInputEvent(
  previous: InputEvent,
  incoming: InputEvent,
): InputEvent {
  return {
    ...incoming,
    id: previous.id,
  };
}
