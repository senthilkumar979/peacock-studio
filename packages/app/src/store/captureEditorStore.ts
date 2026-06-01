import { create } from 'zustand';
import {
  CUSTOM_CAPTURE_BACKGROUND_ID,
  DEFAULT_CAPTURE_EDITOR_SETTINGS,
  type CaptureEditorSettings,
  type CaptureEditorTool,
  type CapturePrivacyRegion,
  type NormalizedRect,
} from '@peacock/shared';
import { cloneCaptureSettings } from '@/capture-editor/cloneCaptureSettings';

const MAX_HISTORY = 30;

interface CaptureEditorState {
  settings: CaptureEditorSettings;
  history: CaptureEditorSettings[];
  historyIndex: number;
  activeTool: CaptureEditorTool;
  selectedId: string | null;
  statusMessage: string;
  setActiveTool: (tool: CaptureEditorTool) => void;
  setSelectedId: (id: string | null) => void;
  commitSettings: (next: CaptureEditorSettings) => void;
  patchSettings: (patch: Partial<CaptureEditorSettings>, commit?: boolean) => void;
  setBackgroundPresetId: (backgroundPresetId: string) => void;
  setCustomBackground: (objectUrl: string) => void;
  clearCustomBackground: () => void;
  setPadding: (padding: number) => void;
  setCornerRadius: (cornerRadius: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCrop: (crop: NormalizedRect, commit?: boolean) => void;
  finalizeCrop: () => void;
  addPrivacyRegion: (region: Omit<CapturePrivacyRegion, 'id'>) => void;
  updatePrivacyRegion: (id: string, patch: Partial<CapturePrivacyRegion>) => void;
  removeSelected: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setStatusMessage: (message: string) => void;
  resetSettings: () => void;
}

function pushHistory(
  history: CaptureEditorSettings[],
  historyIndex: number,
  next: CaptureEditorSettings,
): { history: CaptureEditorSettings[]; historyIndex: number } {
  const trimmed = history.slice(0, historyIndex + 1);
  trimmed.push(cloneCaptureSettings(next));
  if (trimmed.length <= MAX_HISTORY) {
    return { history: trimmed, historyIndex: trimmed.length - 1 };
  }
  const overflow = trimmed.length - MAX_HISTORY;
  return { history: trimmed.slice(overflow), historyIndex: trimmed.length - 1 };
}

export const useCaptureEditorStore = create<CaptureEditorState>((set, get) => ({
  settings: cloneCaptureSettings(DEFAULT_CAPTURE_EDITOR_SETTINGS),
  history: [cloneCaptureSettings(DEFAULT_CAPTURE_EDITOR_SETTINGS)],
  historyIndex: 0,
  activeTool: 'select',
  selectedId: null,
  statusMessage: '',

  setActiveTool: (activeTool) => set({ activeTool, selectedId: null }),
  setSelectedId: (selectedId) => set({ selectedId }),

  commitSettings: (next) => {
    const { history, historyIndex } = pushHistory(get().history, get().historyIndex, next);
    set({ settings: cloneCaptureSettings(next), history, historyIndex });
  },

  patchSettings: (patch, commit = false) => {
    const next = { ...get().settings, ...patch };
    if (commit) {
      get().commitSettings(next);
      return;
    }
    set({ settings: next });
  },

  setBackgroundPresetId: (backgroundPresetId) => {
    get().commitSettings({ ...get().settings, backgroundPresetId });
  },

  setCustomBackground: (objectUrl) => {
    const previous = get().settings.customBackgroundUrl;
    if (previous) URL.revokeObjectURL(previous);
    get().commitSettings({
      ...get().settings,
      backgroundPresetId: CUSTOM_CAPTURE_BACKGROUND_ID,
      customBackgroundUrl: objectUrl,
    });
  },

  clearCustomBackground: () => {
    const previous = get().settings.customBackgroundUrl;
    if (previous) URL.revokeObjectURL(previous);
    get().commitSettings({
      ...get().settings,
      customBackgroundUrl: null,
      backgroundPresetId: 'rose-gold',
    });
  },

  setPadding: (padding) => {
    get().patchSettings({ padding: Math.max(0, Math.round(padding)) }, true);
  },

  setCornerRadius: (cornerRadius) => {
    get().patchSettings({ cornerRadius: Math.max(0, Math.round(cornerRadius)) }, true);
  },

  setTitle: (title) => {
    get().patchSettings({ title });
  },

  setDescription: (description) => {
    get().patchSettings({ description });
  },

  setCrop: (crop, commit = true) => {
    get().patchSettings({ crop }, commit);
  },

  finalizeCrop: () => {
    if (get().activeTool !== 'crop') return;
    get().commitSettings(get().settings);
    set({ activeTool: 'select', selectedId: null });
  },

  addPrivacyRegion: (region) => {
    const item: CapturePrivacyRegion = { ...region, id: crypto.randomUUID() };
    get().commitSettings({
      ...get().settings,
      privacyRegions: [...get().settings.privacyRegions, item],
    });
    set({ selectedId: item.id });
  },

  updatePrivacyRegion: (id, patch) => {
    const privacyRegions = get().settings.privacyRegions.map((region) =>
      region.id === id ? { ...region, ...patch, rect: patch.rect ? { ...patch.rect } : region.rect } : region,
    );
    get().patchSettings({ privacyRegions });
  },

  removeSelected: () => {
    const { selectedId, settings } = get();
    if (!selectedId) return;
    get().commitSettings({
      ...settings,
      privacyRegions: settings.privacyRegions.filter((r) => r.id !== selectedId),
    });
    set({ selectedId: null });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    const settings = history[nextIndex];
    if (!settings) return;
    set({ historyIndex: nextIndex, settings: cloneCaptureSettings(settings) });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const settings = history[nextIndex];
    if (!settings) return;
    set({ historyIndex: nextIndex, settings: cloneCaptureSettings(settings) });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  setStatusMessage: (statusMessage) => set({ statusMessage }),

  resetSettings: () => {
    const previous = get().settings.customBackgroundUrl;
    if (previous) URL.revokeObjectURL(previous);
    const initial = cloneCaptureSettings(DEFAULT_CAPTURE_EDITOR_SETTINGS);
    set({
      settings: initial,
      history: [initial],
      historyIndex: 0,
      activeTool: 'select',
      selectedId: null,
      statusMessage: '',
    });
  },
}));
