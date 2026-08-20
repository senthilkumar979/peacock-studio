import { describe, expect, it } from 'vitest';
import {
  isEditorRoute,
  isSupportWidgetRoute,
  shouldHideSupportWidget,
} from '@/components/support/SupportWidget';

describe('isEditorRoute', () => {
  it('matches flow doc, tour, capture, route, and share editors', () => {
    expect(isEditorRoute('/docs/abc/edit')).toBe(true);
    expect(isEditorRoute('/tours/abc/edit')).toBe(true);
    expect(isEditorRoute('/tours/new')).toBe(true);
    expect(isEditorRoute('/capture/abc/edit')).toBe(true);
    expect(isEditorRoute('/editor')).toBe(true);
    expect(isEditorRoute('/editor/capture/abc/edit')).toBe(true);
    expect(isEditorRoute('/routes/abc/edit')).toBe(true);
    expect(isEditorRoute('/s/token/edit')).toBe(true);
  });

  it('does not match library or player surfaces', () => {
    expect(isEditorRoute('/')).toBe(false);
    expect(isEditorRoute('/dashboard')).toBe(false);
    expect(isEditorRoute('/docs/abc')).toBe(false);
    expect(isEditorRoute('/tours/abc')).toBe(false);
    expect(isEditorRoute('/flow-maps/abc')).toBe(false);
    expect(isEditorRoute('/s/token/embed')).toBe(false);
  });
});

describe('shouldHideSupportWidget', () => {
  it('hides on editor and embed routes', () => {
    expect(shouldHideSupportWidget('/docs/abc/edit')).toBe(true);
    expect(shouldHideSupportWidget('/s/token/embed')).toBe(true);
    expect(shouldHideSupportWidget('/s/token/embed/')).toBe(true);
    expect(shouldHideSupportWidget('/examples/kachabazar')).toBe(true);
  });

  it('does not force-hide landing or normal share view', () => {
    expect(shouldHideSupportWidget('/')).toBe(false);
    expect(shouldHideSupportWidget('/s/token')).toBe(false);
    expect(shouldHideSupportWidget('/dashboard')).toBe(false);
  });
});

describe('isSupportWidgetRoute', () => {
  it('loads chat on landing and pricing', () => {
    expect(isSupportWidgetRoute('/')).toBe(true);
    expect(isSupportWidgetRoute('/pricing')).toBe(true);
  });

  it('does not load chat on app, editor, or embed routes', () => {
    expect(isSupportWidgetRoute('/dashboard')).toBe(false);
    expect(isSupportWidgetRoute('/docs/abc/edit')).toBe(false);
    expect(isSupportWidgetRoute('/s/token/embed')).toBe(false);
  });
});
