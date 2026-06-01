import { createId } from '@peacock/shared';
import type {
  RouteBranchNode,
  RouteBranchOption,
  RouteCanvasPosition,
  RouteChapterNode,
  RouteEdge,
  RouteFormField,
  RouteFormNode,
  RouteInterestNode,
  RouteInterestTopic,
  RouteNode,
  RoutePeacockRef,
  SavedRoute,
} from '@/types/route';

const DEFAULT_CHAPTER_SPACING_Y = 220;
const DEFAULT_NODE_X = 120;

export function createPeacockRef(documentId: string, order: number): RoutePeacockRef {
  return {
    id: createId(),
    documentId,
    order,
  };
}

export function createChapterNode(
  title: string,
  position: RouteCanvasPosition
): RouteChapterNode {
  return {
    id: createId(),
    type: 'chapter',
    title,
    description: '',
    peacocks: [],
    position,
  };
}

export function createBranchNode(
  title: string,
  position: RouteCanvasPosition
): RouteBranchNode {
  const firstOption = createBranchOption('Option A');
  const secondOption = createBranchOption('Option B');

  return {
    id: createId(),
    type: 'branch',
    title,
    description: '',
    options: [firstOption, secondOption],
    position,
  };
}

export function createBranchOption(label: string): RouteBranchOption {
  return {
    id: createId(),
    label,
  };
}

export function createFormNode(title: string, position: RouteCanvasPosition): RouteFormNode {
  return {
    id: createId(),
    type: 'form',
    title,
    description: '',
    fields: [
      { id: createId(), label: 'Your name', type: 'text', required: true },
      { id: createId(), label: 'Email', type: 'email', required: true },
    ],
    position,
  };
}

export function createFormField(label: string, type: RouteFormField['type'] = 'text'): RouteFormField {
  return {
    id: createId(),
    label,
    type,
    required: false,
  };
}

export function createInterestTopic(label: string): RouteInterestTopic {
  return { id: createId(), label };
}

export function createInterestNode(title: string, position: RouteCanvasPosition): RouteInterestNode {
  return {
    id: createId(),
    type: 'interest',
    title,
    description: '',
    allowMultiple: false,
    topics: [
      createInterestTopic('Guided HTML demos'),
      createInterestTopic('AI demo agents'),
    ],
    position,
  };
}

export function createRouteEdge(
  sourceNodeId: string,
  targetNodeId: string,
  sourceHandle?: string
): RouteEdge {
  return {
    id: createId(),
    sourceNodeId,
    targetNodeId,
    sourceHandle,
  };
}

export function createEmptyRoute(): SavedRoute {
  const now = Date.now();
  const entry = createChapterNode('Chapter 1', { x: DEFAULT_NODE_X, y: 80 });

  return {
    id: createId(),
    title: 'Untitled route',
    description: '',
    status: 'draft',
    entryNodeId: entry.id,
    nodes: [entry],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getNextChapterPosition(existingNodes: RouteNode[]): RouteCanvasPosition {
  const count = existingNodes.length;

  return {
    x: DEFAULT_NODE_X + (count % 3) * 280,
    y: 80 + Math.floor(count / 3) * DEFAULT_CHAPTER_SPACING_Y,
  };
}

/** @deprecated Use createChapterNode */
export function createEmptyChapter(title?: string): RouteChapterNode {
  return createChapterNode(title ?? 'New chapter', { x: DEFAULT_NODE_X, y: 80 });
}
