import { useEffect, useRef, type RefObject } from 'react';
import { FLOW_DETAILS_OUTLINE_ID } from '@/utils/shareLink';

const OUTLINE_ACTIVATION_OFFSET_PX = 96;

function resolveActiveOutlineItemId(root: HTMLElement): string {
  const markers = root.querySelectorAll<HTMLElement>('[data-outline-id]');
  if (!markers.length) return FLOW_DETAILS_OUTLINE_ID;

  const activationLine = root.getBoundingClientRect().top + OUTLINE_ACTIVATION_OFFSET_PX;
  let activeItemId = markers[0]?.getAttribute('data-outline-id') ?? FLOW_DETAILS_OUTLINE_ID;

  markers.forEach((marker) => {
    if (marker.getBoundingClientRect().top <= activationLine) {
      const outlineId = marker.getAttribute('data-outline-id');
      if (outlineId) activeItemId = outlineId;
    }
  });

  return activeItemId;
}

export function useDocumentOutlineScrollSpy(
  scrollContainerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onActiveItemChange: (itemId: string) => void,
  refreshKey: string,
  pausedRef: RefObject<boolean>,
): void {
  useEffect(() => {
    if (!enabled) return;

    const root = scrollContainerRef.current;
    if (!root) return;

    const syncActiveItem = () => {
      if (pausedRef.current) return;
      onActiveItemChange(resolveActiveOutlineItemId(root));
    };

    root.addEventListener('scroll', syncActiveItem, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (pausedRef.current) return;
      syncActiveItem();
    });
    resizeObserver.observe(root);

    return () => {
      root.removeEventListener('scroll', syncActiveItem);
      resizeObserver.disconnect();
    };
  }, [enabled, onActiveItemChange, refreshKey, scrollContainerRef, pausedRef]);
}

export function scrollDocumentPaneToAnchor(
  scrollContainer: HTMLElement | null,
  anchorId: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  const target = document.getElementById(anchorId);
  if (!target) return;

  if (!scrollContainer?.contains(target)) {
    target.scrollIntoView({ block: 'start', behavior, inline: 'nearest' });
    return;
  }

  const containerTop = scrollContainer.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  const nextTop = targetTop - containerTop + scrollContainer.scrollTop - OUTLINE_ACTIVATION_OFFSET_PX;

  scrollContainer.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}
