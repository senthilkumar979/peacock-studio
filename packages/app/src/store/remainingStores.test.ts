import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_CAPTURE_EDITOR_SETTINGS } from '@peacock/shared';
import { useCaptureEditorStore } from './captureEditorStore';
import { useConsentStore } from './consentStore';
import { useProductTourBuilderStore } from './productTourBuilderStore';
import { useRouteBuilderStore } from './routeBuilderStore';
import { createEmptyProductTour } from '@/utils/createProductTour';
import { createEmptyRoute } from '@/utils/createRoute';
import { CONSENT_STORAGE_KEY } from '@/constants/consent';

describe('captureEditorStore', () => {
  beforeEach(() => {
    useCaptureEditorStore.getState().resetSettings();
  });

  it('patches settings, history, and privacy regions', () => {
    const store = useCaptureEditorStore.getState();
    store.setTitle('Hello');
    store.setDescription('Desc');
    store.setPadding(40);
    store.setCornerRadius(12);
    store.setFrameCornerRadius(8);
    store.setBackgroundPresetId('charcoal');
    store.setActiveTool('crop');
    store.setCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 });
    store.finalizeCrop();
    expect(useCaptureEditorStore.getState().activeTool).toBe('select');

    store.addPrivacyRegion({
      mode: 'blur',
      intensity: 10,
      rect: { x: 0.2, y: 0.2, width: 0.2, height: 0.2 },
    });
    const selectedId = useCaptureEditorStore.getState().selectedId;
    expect(selectedId).toBeTruthy();
    store.updatePrivacyRegion(selectedId!, { intensity: 16 });
    expect(useCaptureEditorStore.getState().settings.privacyRegions[0]?.intensity).toBe(16);
    expect(useCaptureEditorStore.getState().canUndo()).toBe(true);
    store.undo();
    store.redo();
    store.removeSelected();
    expect(useCaptureEditorStore.getState().settings.privacyRegions).toHaveLength(0);
    store.setStatusMessage('Saved');
    expect(useCaptureEditorStore.getState().statusMessage).toBe('Saved');
    store.patchSettings({ title: 'Patched' }, true);
    expect(useCaptureEditorStore.getState().settings.title).toBe('Patched');
    store.commitSettings({ ...DEFAULT_CAPTURE_EDITOR_SETTINGS, title: 'Committed' });
    expect(useCaptureEditorStore.getState().settings.title).toBe('Committed');
  });
});

describe('consentStore', () => {
  beforeEach(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    useConsentStore.getState().resetConsent();
  });

  it('accepts, rejects, and toggles preferences', () => {
    const store = useConsentStore.getState();
    store.openPreferences();
    expect(useConsentStore.getState().isPreferencesOpen).toBe(true);
    store.closePreferences();
    expect(useConsentStore.getState().isPreferencesOpen).toBe(false);

    store.acceptAll();
    expect(useConsentStore.getState().record?.analytics).toBe(true);
    store.rejectNonEssential();
    expect(useConsentStore.getState().record?.analytics).toBe(false);
    store.savePreferences(true);
    expect(useConsentStore.getState().record?.analytics).toBe(true);
    store.resetConsent();
    expect(useConsentStore.getState().record).toBeNull();
  });
});

describe('productTourBuilderStore', () => {
  beforeEach(() => {
    useProductTourBuilderStore.getState().resetTour();
  });

  it('hydrates and mutates tour features/demos', () => {
    const tour = createEmptyProductTour();
    useProductTourBuilderStore.getState().hydrateFromTour(tour);
    const store = useProductTourBuilderStore.getState();
    store.updateTourDetails('New title', 'New desc');
    store.setTourStatus('live');
    store.setPersonaId('persona-2');
    store.setTourGoal('Learn fast');
    store.setCompletionCta({ label: 'Done', url: 'https://example.com' });
    store.addFeature();
    const featureId = useProductTourBuilderStore.getState().tour!.features[0]!.id;
    store.updateFeature(featureId, 'Feature A', 'About A');
    store.addDemo(featureId, 'doc-1');
    store.addDemo(featureId, 'doc-2');
    const demos = useProductTourBuilderStore.getState().tour!.features[0]!.demos;
    expect(demos).toHaveLength(2);
    store.reorderDemos(featureId, 0, 1);
    store.removeDemo(featureId, demos[0]!.id);
    const second = useProductTourBuilderStore.getState().tour!.features[1]!.id;
    store.deleteFeature(second);
    expect(useProductTourBuilderStore.getState().tour!.features).toHaveLength(1);
    expect(useProductTourBuilderStore.getState().tour!.title).toBe('New title');
  });
});

describe('routeBuilderStore', () => {
  beforeEach(() => {
    useRouteBuilderStore.getState().resetRoute();
  });

  it('hydrates and edits a route graph', () => {
    const route = createEmptyRoute();
    useRouteBuilderStore.getState().hydrateFromRoute(route);
    const entryId = useRouteBuilderStore.getState().route!.entryNodeId;

    const store = useRouteBuilderStore.getState();
    store.updateRouteDetails('Route A', 'About route');
    store.setRouteStatus('live');
    store.addChapter();
    store.addBranchNode();
    store.addFormNode();
    store.addInterestNode();

    const nodes = useRouteBuilderStore.getState().route!.nodes;
    const chapter = nodes.find((node) => node.type === 'chapter' && node.id !== entryId)!;
    const branch = nodes.find((node) => node.type === 'branch')!;
    const form = nodes.find((node) => node.type === 'form')!;
    const interest = nodes.find((node) => node.type === 'interest')!;

    store.updateChapter(chapter.id, 'Ch 2', 'Second');
    store.updateBranchNode(branch.id, 'Branch', 'Pick');
    store.updateFormNode(form.id, 'Form', 'Collect');
    store.updateInterestNode(interest.id, 'Interests', 'Topics');
    store.setInterestAllowMultiple(interest.id, true);
    store.addBranchOption(branch.id);
    store.updateBranchOptionLabel(branch.id, branch.options[0]!.id, 'Admin');
    store.addFormField(form.id);
    const fieldId = useRouteBuilderStore.getState().route!.nodes.find((n) => n.id === form.id)!;
    if (fieldId.type === 'form') {
      store.updateFormField(form.id, fieldId.fields[0]!.id, 'Email', 'email', true);
    }
    store.addInterestTopic(interest.id);
    store.updateInterestTopicLabel(interest.id, interest.topics[0]!.id, 'Billing');
    store.addPeacock(entryId, 'doc-1');
    store.addPeacock(entryId, 'doc-2');
    store.reorderPeacocks(entryId, 0, 1);
    const peacocks =
      useRouteBuilderStore.getState().route!.nodes.find((n) => n.id === entryId)!.type === 'chapter'
        ? (
            useRouteBuilderStore.getState().route!.nodes.find((n) => n.id === entryId) as {
              peacocks: { id: string }[];
            }
          ).peacocks
        : [];
    if (peacocks[0]) store.removePeacock(entryId, peacocks[0].id);

    store.updateNodePosition(entryId, { x: 40, y: 80 });
    store.setSelectedNodeId(branch.id);
    store.setEntryNodeId(entryId);
    store.undo();
    store.redo();
    store.deleteNode(interest.id);
    expect(useRouteBuilderStore.getState().route!.title).toBe('Route A');
    expect(useRouteBuilderStore.getState().isLoaded).toBe(true);
  });
});
