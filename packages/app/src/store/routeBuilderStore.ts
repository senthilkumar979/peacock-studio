import type {
  RouteBranchNode,
  RouteCanvasPosition,
  RouteChapterNode,
  RouteEdge,
  RouteFormFieldType,
  RouteFormNode,
  RouteInterestNode,
  RouteNode,
  RouteStatus,
  SavedRoute,
} from '@/types/route';
import {
  createBranchNode,
  createBranchOption,
  createChapterNode,
  createFormField,
  createFormNode,
  createInterestNode,
  createInterestTopic,
  createPeacockRef,
  createRouteEdge,
  getNextChapterPosition,
} from '@/utils/createRoute';
import {
  getIncomingEdges,
  getOutgoingEdges,
  getRouteNode,
  migrateSavedRoute,
} from '@/utils/routeGraph';
import { cloneSavedRoute, recordRouteHistory } from '@/utils/routeHistory';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface RouteBuilderStore {
  route: SavedRoute | null;
  isLoaded: boolean;
  selectedNodeId: string | null;
  past: SavedRoute[];
  future: SavedRoute[];

  hydrateFromRoute: (route: SavedRoute) => void;
  resetRoute: () => void;
  undo: () => void;
  redo: () => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setEntryNodeId: (nodeId: string) => void;
  updateRouteDetails: (title: string, description: string) => void;
  setRouteStatus: (status: RouteStatus) => void;
  addChapter: () => void;
  addBranchNode: () => void;
  addFormNode: () => void;
  addInterestNode: () => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: RouteCanvasPosition) => void;
  addGraphEdge: (edge: RouteEdge) => void;
  removeGraphEdge: (edgeId: string) => void;
  updateChapter: (nodeId: string, title: string, description: string) => void;
  updateBranchNode: (nodeId: string, title: string, description: string) => void;
  updateFormNode: (nodeId: string, title: string, description: string) => void;
  updateInterestNode: (nodeId: string, title: string, description: string) => void;
  setInterestAllowMultiple: (nodeId: string, allowMultiple: boolean) => void;
  addBranchOption: (nodeId: string) => void;
  removeBranchOption: (nodeId: string, optionId: string) => void;
  updateBranchOptionLabel: (nodeId: string, optionId: string, label: string) => void;
  addFormField: (nodeId: string) => void;
  removeFormField: (nodeId: string, fieldId: string) => void;
  updateFormField: (
    nodeId: string,
    fieldId: string,
    label: string,
    type: RouteFormFieldType,
    required: boolean
  ) => void;
  addInterestTopic: (nodeId: string) => void;
  removeInterestTopic: (nodeId: string, topicId: string) => void;
  updateInterestTopicLabel: (nodeId: string, topicId: string, label: string) => void;
  addPeacock: (nodeId: string, documentId: string) => void;
  removePeacock: (nodeId: string, peacockRefId: string) => void;
  reorderPeacocks: (nodeId: string, from: number, to: number) => void;
}

function reorderPeacockOrders(peacocks: RouteChapterNode['peacocks']): void {
  peacocks.forEach((peacock, index) => {
    peacock.order = index;
  });
}

function findTailNodeId(route: SavedRoute): string | null {
  let currentId: string | null = route.entryNodeId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const outgoing = getOutgoingEdges(route, currentId);
    if (outgoing.length === 0) return currentId;
    currentId = outgoing[0]?.targetNodeId ?? null;
  }

  return route.nodes[route.nodes.length - 1]?.id ?? null;
}

function getChapterNode(state: SavedRoute, nodeId: string): RouteChapterNode | null {
  const node = getRouteNode(state, nodeId);
  return node?.type === 'chapter' ? node : null;
}

function getBranchNode(state: SavedRoute, nodeId: string): RouteBranchNode | null {
  const node = getRouteNode(state, nodeId);
  return node?.type === 'branch' ? node : null;
}

function getFormNode(state: SavedRoute, nodeId: string): RouteFormNode | null {
  const node = getRouteNode(state, nodeId);
  return node?.type === 'form' ? node : null;
}

function getInterestNode(state: SavedRoute, nodeId: string): RouteInterestNode | null {
  const node = getRouteNode(state, nodeId);
  return node?.type === 'interest' ? node : null;
}

export const useRouteBuilderStore = create<RouteBuilderStore>()(
  immer((set) => ({
    route: null,
    isLoaded: false,
    selectedNodeId: null,
    past: [],
    future: [],

    hydrateFromRoute: (route) => {
      const migrated = migrateSavedRoute(route);
      set({
        route: migrated,
        isLoaded: true,
        selectedNodeId: migrated.entryNodeId,
        past: [],
        future: [],
      });
    },

    resetRoute: () =>
      set({
        route: null,
        isLoaded: false,
        selectedNodeId: null,
        past: [],
        future: [],
      }),

    undo: () =>
      set((state) => {
        if (!state.route || state.past.length === 0) return;
        const previous = state.past[state.past.length - 1];
        if (!previous) return;
        state.future.unshift(cloneSavedRoute(state.route));
        state.route = state.past.pop() ?? state.route;
        if (
          state.selectedNodeId &&
          !state.route.nodes.some((node) => node.id === state.selectedNodeId)
        ) {
          state.selectedNodeId = state.route.entryNodeId;
        }
      }),

    redo: () =>
      set((state) => {
        if (!state.route || state.future.length === 0) return;
        const next = state.future[0];
        if (!next) return;
        state.past.push(cloneSavedRoute(state.route));
        state.future.shift();
        state.route = next;
      }),

    setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

    setEntryNodeId: (nodeId) =>
      set((state) => {
        if (!state.route || !getRouteNode(state.route, nodeId)) return;
        recordRouteHistory(state);
        state.route.entryNodeId = nodeId;
      }),

    updateRouteDetails: (title, description) =>
      set((state) => {
        if (!state.route) return;
        state.route.title = title;
        state.route.description = description;
      }),

    setRouteStatus: (status) =>
      set((state) => {
        if (!state.route) return;
        state.route.status = status;
      }),

    addChapter: () =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const position = getNextChapterPosition(state.route.nodes);
        const chapterNumber = state.route.nodes.filter((node) => node.type === 'chapter').length + 1;
        const chapter = createChapterNode(`Chapter ${chapterNumber}`, position);
        state.route.nodes.push(chapter);
        const tailId = findTailNodeId(state.route);
        if (tailId && tailId !== chapter.id) {
          state.route.edges.push(createRouteEdge(tailId, chapter.id));
        }
        state.selectedNodeId = chapter.id;
      }),

    addBranchNode: () =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const branch = createBranchNode('Route branch', getNextChapterPosition(state.route.nodes));
        state.route.nodes.push(branch);
        state.selectedNodeId = branch.id;
      }),

    addFormNode: () =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const form = createFormNode('Lead capture form', getNextChapterPosition(state.route.nodes));
        state.route.nodes.push(form);
        state.selectedNodeId = form.id;
      }),

    addInterestNode: () =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const interest = createInterestNode('Mention your misc topics here', getNextChapterPosition(state.route.nodes));
        state.route.nodes.push(interest);
        state.selectedNodeId = interest.id;
      }),

    deleteNode: (nodeId) =>
      set((state) => {
        if (!state.route || state.route.nodes.length <= 1) return;
        recordRouteHistory(state);
        state.route.nodes = state.route.nodes.filter((node) => node.id !== nodeId);
        state.route.edges = state.route.edges.filter(
          (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
        );
        if (state.route.entryNodeId === nodeId) {
          state.route.entryNodeId = state.route.nodes[0]?.id ?? '';
        }
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = state.route.entryNodeId;
        }
      }),

    updateNodePosition: (nodeId, position) =>
      set((state) => {
        if (!state.route) return;
        const node = getRouteNode(state.route, nodeId);
        if (!node) return;
        node.position = position;
      }),

    addGraphEdge: (edge) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const exists = state.route.edges.some(
          (item) =>
            item.sourceNodeId === edge.sourceNodeId &&
            item.targetNodeId === edge.targetNodeId &&
            item.sourceHandle === edge.sourceHandle
        );
        if (!exists) state.route.edges.push(edge);
      }),

    removeGraphEdge: (edgeId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        state.route.edges = state.route.edges.filter((edge) => edge.id !== edgeId);
      }),

    updateChapter: (nodeId, title, description) =>
      set((state) => {
        if (!state.route) return;
        const chapter = getChapterNode(state.route, nodeId);
        if (!chapter) return;
        chapter.title = title;
        chapter.description = description;
      }),

    updateBranchNode: (nodeId, title, description) =>
      set((state) => {
        if (!state.route) return;
        const branch = getBranchNode(state.route, nodeId);
        if (!branch) return;
        branch.title = title;
        branch.description = description;
      }),

    updateFormNode: (nodeId, title, description) =>
      set((state) => {
        if (!state.route) return;
        const form = getFormNode(state.route, nodeId);
        if (!form) return;
        form.title = title;
        form.description = description;
      }),

    updateInterestNode: (nodeId, title, description) =>
      set((state) => {
        if (!state.route) return;
        const interest = getInterestNode(state.route, nodeId);
        if (!interest) return;
        interest.title = title;
        interest.description = description;
      }),

    setInterestAllowMultiple: (nodeId, allowMultiple) =>
      set((state) => {
        if (!state.route) return;
        const interest = getInterestNode(state.route, nodeId);
        if (!interest) return;
        interest.allowMultiple = allowMultiple;
      }),

    addBranchOption: (nodeId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const branch = getBranchNode(state.route, nodeId);
        if (!branch) return;
        branch.options.push(createBranchOption(`Option ${branch.options.length + 1}`));
      }),

    removeBranchOption: (nodeId, optionId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const branch = getBranchNode(state.route, nodeId);
        if (!branch || branch.options.length <= 2) return;
        branch.options = branch.options.filter((option) => option.id !== optionId);
        state.route.edges = state.route.edges.filter((edge) => edge.sourceHandle !== optionId);
      }),

    updateBranchOptionLabel: (nodeId, optionId, label) =>
      set((state) => {
        if (!state.route) return;
        const branch = getBranchNode(state.route, nodeId);
        const option = branch?.options.find((item) => item.id === optionId);
        if (!option) return;
        option.label = label;
      }),

    addFormField: (nodeId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const form = getFormNode(state.route, nodeId);
        if (!form) return;
        form.fields.push(createFormField(`Field ${form.fields.length + 1}`));
      }),

    removeFormField: (nodeId, fieldId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const form = getFormNode(state.route, nodeId);
        if (!form || form.fields.length <= 1) return;
        form.fields = form.fields.filter((field) => field.id !== fieldId);
      }),

    updateFormField: (nodeId, fieldId, label, type, required) =>
      set((state) => {
        if (!state.route) return;
        const form = getFormNode(state.route, nodeId);
        const field = form?.fields.find((item) => item.id === fieldId);
        if (!field) return;
        field.label = label;
        field.type = type;
        field.required = required;
      }),

    addInterestTopic: (nodeId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const interest = getInterestNode(state.route, nodeId);
        if (!interest) return;
        interest.topics.push(createInterestTopic(`Topic ${interest.topics.length + 1}`));
      }),

    removeInterestTopic: (nodeId, topicId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const interest = getInterestNode(state.route, nodeId);
        if (!interest || interest.topics.length <= 2) return;
        interest.topics = interest.topics.filter((topic) => topic.id !== topicId);
        state.route.edges = state.route.edges.filter((edge) => edge.sourceHandle !== topicId);
      }),

    updateInterestTopicLabel: (nodeId, topicId, label) =>
      set((state) => {
        if (!state.route) return;
        const interest = getInterestNode(state.route, nodeId);
        const topic = interest?.topics.find((item) => item.id === topicId);
        if (!topic) return;
        topic.label = label;
      }),

    addPeacock: (nodeId, documentId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const chapter = getChapterNode(state.route, nodeId);
        if (!chapter) return;
        if (chapter.peacocks.some((peacock) => peacock.documentId === documentId)) return;
        chapter.peacocks.push(createPeacockRef(documentId, chapter.peacocks.length));
      }),

    removePeacock: (nodeId, peacockRefId) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const chapter = getChapterNode(state.route, nodeId);
        if (!chapter) return;
        chapter.peacocks = chapter.peacocks.filter((peacock) => peacock.id !== peacockRefId);
        reorderPeacockOrders(chapter.peacocks);
      }),

    reorderPeacocks: (nodeId, from, to) =>
      set((state) => {
        if (!state.route) return;
        recordRouteHistory(state);
        const chapter = getChapterNode(state.route, nodeId);
        if (!chapter) return;
        const next = [...chapter.peacocks].sort((a, b) => a.order - b.order);
        const [moved] = next.splice(from, 1);
        if (!moved) return;
        next.splice(to, 0, moved);
        chapter.peacocks = next;
        reorderPeacockOrders(chapter.peacocks);
      }),
  }))
);

export function getSelectedRouteNode(route: SavedRoute, selectedNodeId: string | null): RouteNode | null {
  if (!selectedNodeId) return null;
  return getRouteNode(route, selectedNodeId) ?? null;
}

export function getNodeConnectionSummary(route: SavedRoute, nodeId: string): string {
  const incoming = getIncomingEdges(route, nodeId).length;
  const outgoing = getOutgoingEdges(route, nodeId).length;
  return `${incoming} in · ${outgoing} out`;
}

export function canUndoRoute(): boolean {
  return useRouteBuilderStore.getState().past.length > 0;
}

export function canRedoRoute(): boolean {
  return useRouteBuilderStore.getState().future.length > 0;
}
