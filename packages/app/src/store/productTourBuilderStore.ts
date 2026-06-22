import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ProductTour, ProductTourCompletionCta, ProductTourStatus } from '@/types/productTour';
import { createTourDemoRef, createTourFeature, sortTourFeatures } from '@/utils/createProductTour';

interface ProductTourBuilderStore {
  tour: ProductTour | null;
  isLoaded: boolean;

  hydrateFromTour: (tour: ProductTour) => void;
  resetTour: () => void;
  updateTourDetails: (title: string, description: string) => void;
  setTourStatus: (status: ProductTourStatus) => void;
  setPersonaId: (personaId: string) => void;
  setTourGoal: (tourGoal: string) => void;
  setCompletionCta: (cta: ProductTourCompletionCta | undefined) => void;
  addFeature: () => void;
  updateFeature: (featureId: string, title: string, description: string) => void;
  deleteFeature: (featureId: string) => void;
  addDemo: (featureId: string, documentId: string) => void;
  removeDemo: (featureId: string, demoId: string) => void;
  reorderDemos: (featureId: string, from: number, to: number) => void;
}

function normalizeFeatureOrders(features: ProductTour['features']): void {
  sortTourFeatures(features).forEach((feature, index) => {
    feature.order = index;
  });
}

export const useProductTourBuilderStore = create<ProductTourBuilderStore>()(
  immer((set) => ({
    tour: null,
    isLoaded: false,

    hydrateFromTour: (tour) => set({ tour, isLoaded: true }),

    resetTour: () => set({ tour: null, isLoaded: false }),

    updateTourDetails: (title, description) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.title = title;
        state.tour.description = description;
      }),

    setTourStatus: (status) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.status = status;
      }),

    setPersonaId: (personaId) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.personaId = personaId;
      }),

    setTourGoal: (tourGoal) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.tourGoal = tourGoal;
      }),

    setCompletionCta: (cta) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.completionCta = cta;
      }),

    addFeature: () =>
      set((state) => {
        if (!state.tour) return;
        const order = state.tour.features.length;
        state.tour.features.push(createTourFeature(`Feature ${order + 1}`, order));
      }),

    updateFeature: (featureId, title, description) =>
      set((state) => {
        if (!state.tour) return;
        const feature = state.tour.features.find((item) => item.id === featureId);
        if (!feature) return;
        feature.title = title;
        feature.description = description;
      }),

    deleteFeature: (featureId) =>
      set((state) => {
        if (!state.tour || state.tour.features.length <= 1) return;
        state.tour.features = state.tour.features.filter((item) => item.id !== featureId);
        normalizeFeatureOrders(state.tour.features);
      }),

    addDemo: (featureId, documentId) =>
      set((state) => {
        if (!state.tour) return;
        const feature = state.tour.features.find((item) => item.id === featureId);
        if (!feature) return;
        feature.demos.push(createTourDemoRef(documentId, feature.demos.length));
      }),

    removeDemo: (featureId, demoId) =>
      set((state) => {
        if (!state.tour) return;
        const feature = state.tour.features.find((item) => item.id === featureId);
        if (!feature) return;
        feature.demos = feature.demos
          .filter((demo) => demo.id !== demoId)
          .map((demo, index) => ({ ...demo, order: index }));
      }),

    reorderDemos: (featureId, from, to) =>
      set((state) => {
        if (!state.tour) return;
        const feature = state.tour.features.find((item) => item.id === featureId);
        if (!feature) return;
        const [item] = feature.demos.splice(from, 1);
        if (!item) return;
        feature.demos.splice(to, 0, item);
        feature.demos.forEach((demo, index) => {
          demo.order = index;
        });
      }),
  })),
);

export function getSortedFeatures(tour: ProductTour) {
  return sortTourFeatures(tour.features);
}
