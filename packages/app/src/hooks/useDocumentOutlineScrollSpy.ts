import { useEffect, useRef, type RefObject } from 'react';
import { FLOW_DETAILS_OUTLINE_ID } from '@/utils/shareLink';

const FLOW_DOC_STICKY_HEADER_SELECTOR = '[data-flow-doc-sticky-header]';
const ACTIVATION_GAP_PX = 75;

function getStickyHeaderBottom(): number {
  const header = document.querySelector<HTMLElement>(FLOW_DOC_STICKY_HEADER_SELECTOR);
  if (!header) return ACTIVATION_GAP_PX;
  return header.getBoundingClientRect().bottom;
}

/** Viewport Y where the active outline item switches — just below the sticky doc header. */
export function getDocumentOutlineActivationTop(
  scrollContainer?: HTMLElement | null,
): number {
  if (scrollContainer) {
    return scrollContainer.getBoundingClientRect().top + ACTIVATION_GAP_PX;
  }

  return getStickyHeaderBottom() + ACTIVATION_GAP_PX;
}

function syncActiveOutlineItem(
  root: HTMLElement,
  activationTop: number,
  onActiveItemChange: (itemId: string) => void,
): void {
  const markers = root.querySelectorAll<HTMLElement>('[data-outline-id]');
  if (!markers.length) return;

  let activeItemId = markers[0]?.getAttribute('data-outline-id') ?? FLOW_DETAILS_OUTLINE_ID;

  markers.forEach((marker) => {
    if (marker.getBoundingClientRect().top <= activationTop) {
      const outlineId = marker.getAttribute('data-outline-id');
      if (outlineId) activeItemId = outlineId;
    }
  });

  onActiveItemChange(activeItemId);
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
      syncActiveOutlineItem(
        root,
        getDocumentOutlineActivationTop(root),
        onActiveItemChange,
      );
    };

    root.addEventListener('scroll', syncActiveItem, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (pausedRef.current) return;
      syncActiveItem();
    });
    resizeObserver.observe(root);

    const header = document.querySelector(FLOW_DOC_STICKY_HEADER_SELECTOR);
    const headerResizeObserver =
      header instanceof HTMLElement
        ? new ResizeObserver(() => {
            if (pausedRef.current) return;
            syncActiveItem();
          })
        : null;
    if (header instanceof HTMLElement) headerResizeObserver?.observe(header);

    syncActiveItem();

    return () => {
      root.removeEventListener('scroll', syncActiveItem);
      resizeObserver.disconnect();
      headerResizeObserver?.disconnect();
    };
  }, [enabled, onActiveItemChange, refreshKey, scrollContainerRef, pausedRef]);
}

export function useDocumentWindowOutlineScrollSpy(
  contentRootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onActiveItemChange: (itemId: string) => void,
  refreshKey: string,
  pausedRef: RefObject<boolean>,
): void {
  useEffect(() => {
    if (!enabled) return;

    const syncActiveItem = () => {
      if (pausedRef.current) return;
      const root = contentRootRef.current;
      if (!root) return;
      syncActiveOutlineItem(root, getDocumentOutlineActivationTop(), onActiveItemChange);
    };

    window.addEventListener('scroll', syncActiveItem, { passive: true });
    window.addEventListener('resize', syncActiveItem);
    syncActiveItem();

    const header = document.querySelector(FLOW_DOC_STICKY_HEADER_SELECTOR);
    const headerResizeObserver =
      header instanceof HTMLElement
        ? new ResizeObserver(() => {
            if (pausedRef.current) return;
            syncActiveItem();
          })
        : null;
    if (header instanceof HTMLElement) headerResizeObserver?.observe(header);

    return () => {
      window.removeEventListener('scroll', syncActiveItem);
      window.removeEventListener('resize', syncActiveItem);
      headerResizeObserver?.disconnect();
    };
  }, [contentRootRef, enabled, onActiveItemChange, pausedRef, refreshKey]);
}

export function scrollDocumentPaneToAnchor(
  scrollContainer: HTMLElement | null,
  anchorId: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  const target = document.getElementById(anchorId);
  if (!target) return;

  const activationTop = getDocumentOutlineActivationTop(scrollContainer ?? undefined);

  if (!scrollContainer?.contains(target)) {
    const nextTop = window.scrollY + target.getBoundingClientRect().top - activationTop;
    window.scrollTo({ top: Math.max(0, nextTop), behavior });
    return;
  }

  const nextTop =
    scrollContainer.scrollTop + target.getBoundingClientRect().top - activationTop;

  scrollContainer.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}
