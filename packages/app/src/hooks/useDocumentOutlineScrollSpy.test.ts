import { act, renderHook } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getDocumentOutlineActivationTop,
  scrollDocumentPaneToAnchor,
  useDocumentOutlineScrollSpy,
  useDocumentWindowOutlineScrollSpy,
} from './useDocumentOutlineScrollSpy';

describe('getDocumentOutlineActivationTop', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('uses scroll container top plus gap when provided', () => {
    const el = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 40,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    expect(getDocumentOutlineActivationTop(el)).toBe(115);
  });

  it('falls back to sticky header bottom when present', () => {
    const header = document.createElement('div');
    header.setAttribute('data-flow-doc-sticky-header', '');
    document.body.appendChild(header);
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 50,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    expect(getDocumentOutlineActivationTop()).toBe(125);
  });
});

describe('useDocumentOutlineScrollSpy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('syncs active outline item on scroll', () => {
    const root = document.createElement('div');
    const m1 = document.createElement('div');
    m1.setAttribute('data-outline-id', 'a');
    const m2 = document.createElement('div');
    m2.setAttribute('data-outline-id', 'b');
    root.append(m1, m2);
    document.body.appendChild(root);

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(m1, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(m2, 'getBoundingClientRect').mockReturnValue({
      top: 20,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const onChange = vi.fn();
    const scrollRef = createRef<HTMLElement | null>();
    scrollRef.current = root;
    const pausedRef = createRef<boolean>();
    pausedRef.current = false;

    renderHook(() =>
      useDocumentOutlineScrollSpy(scrollRef, true, onChange, 'key', pausedRef as RefObject<boolean>),
    );
    expect(onChange).toHaveBeenCalled();

    act(() => {
      root.dispatchEvent(new Event('scroll'));
    });
    expect(onChange.mock.calls.length).toBeGreaterThan(1);
  });

  it('no-ops when disabled', () => {
    const onChange = vi.fn();
    const scrollRef = createRef<HTMLElement | null>();
    const pausedRef = createRef<boolean>();
    pausedRef.current = false;
    renderHook(() =>
      useDocumentOutlineScrollSpy(scrollRef, false, onChange, 'key', pausedRef as RefObject<boolean>),
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useDocumentWindowOutlineScrollSpy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('listens to window scroll when enabled', () => {
    const root = document.createElement('div');
    const marker = document.createElement('div');
    marker.setAttribute('data-outline-id', 'overview');
    root.appendChild(marker);
    document.body.appendChild(root);

    const onChange = vi.fn();
    const contentRef = createRef<HTMLElement | null>();
    contentRef.current = root;
    const pausedRef = createRef<boolean>();
    pausedRef.current = false;

    renderHook(() =>
      useDocumentWindowOutlineScrollSpy(contentRef, true, onChange, 'k', pausedRef as RefObject<boolean>),
    );
    expect(onChange).toHaveBeenCalled();
  });
});

describe('scrollDocumentPaneToAnchor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrolls window when target is outside container', () => {
    const target = document.createElement('div');
    target.id = 'anchor-1';
    document.body.appendChild(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    scrollDocumentPaneToAnchor(null, 'anchor-1', 'auto');
    expect(scrollTo).toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it('scrolls container when it contains the target', () => {
    const container = document.createElement('div');
    const target = document.createElement('div');
    target.id = 'in-pane';
    container.appendChild(target);
    document.body.appendChild(container);
    Object.defineProperty(container, 'scrollTop', { value: 10, writable: true });
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo as never;
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    scrollDocumentPaneToAnchor(container, 'in-pane', 'auto');
    expect(scrollTo).toHaveBeenCalled();
  });
});
