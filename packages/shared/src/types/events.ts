import type { FlowCaptureEnvironment } from './captureEnvironment';

export type EventType = 'click' | 'input' | 'navigation' | 'tab-switch' | 'scroll';

export interface Viewport {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  dpr: number;
}

export interface NormalizedPosition {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
}

export interface DataAttributes {
  [key: string]: string;
}

export interface ParentElementSnapshot {
  tagName: string;
  id: string;
  role: string | null;
  classes: string[];
  name: string | null;
  text: string;
  dataAttributes: DataAttributes;
}

export interface LabelInfo {
  text: string | null;
  htmlFor: string | null;
  ariaLabel: string | null;
  ariaLabelledBy: string | null;
  placeholder: string | null;
}

export interface ElementSnapshot {
  tagName: string;
  type: string | null;
  id: string;
  name: string | null;
  role: string | null;
  classes: string[];
  selector: string;
  xpath: string;
  innerText: string;
  innerHTML: string | null;
  label: LabelInfo;
  valuePreview: string | null;
  dataAttributes: DataAttributes;
  ariaDescription: string | null;
  parent: ParentElementSnapshot | null;
  grandparent: ParentElementSnapshot | null;
  isButton: boolean;
  isLink: boolean;
  isInput: boolean;
  isSelect: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
}

export interface ClickEvent {
  id: string;
  type: 'click';
  timestamp: number;
  url: string;
  title: string;
  viewport: Viewport;
  position: NormalizedPosition;
  element: ElementSnapshot;
  screenshotId: string;
}

export interface InputEvent {
  id: string;
  type: 'input';
  timestamp: number;
  url: string;
  title: string;
  viewport?: Viewport;
  position?: NormalizedPosition;
  element: ElementSnapshot;
  valuePreview: string;
  screenshotId: string;
}

export interface NavigationEvent {
  id: string;
  type: 'navigation';
  timestamp: number;
  fromUrl: string;
  toUrl: string;
}

export interface PageViewEvent {
  id: string;
  type: 'page-view';
  timestamp: number;
  url: string;
  title: string;
  viewport: Viewport;
  screenshotId: string;
  /** True when the user navigated to this page after a prior action (SPA, reload, or new tab). */
  navigationRedirect?: boolean;
}

export type FlowEvent = ClickEvent | InputEvent | NavigationEvent | PageViewEvent;

export interface FlowStep {
  id: string;
  event: FlowEvent;
  title: string;
  notes: string;
  generatedTitle: string;
  generatedDescription: string;
  screenshotId: string;
  /** When set, display and export use this id in screenshotUrls instead of the captured screenshot. */
  customScreenshotId?: string;
}

export interface FlowSection {
  id: string;
  kind: 'section';
  title: string;
  description: string;
}

export type FlowBranchPresentation = 'list' | 'grid';

export interface LinkedPeacockPath {
  id: string;
  label: string;
  targetDocumentId: string;
  targetTitle: string;
  targetDescription: string;
  fromStepId: string;
  toStepId: string;
  order: number;
}

export interface FlowBranch {
  id: string;
  kind: 'branch';
  title: string;
  description: string;
  paths: LinkedPeacockPath[];
  presentation?: FlowBranchPresentation;
}

export type FlowOutlineItem = FlowStep | FlowSection | FlowBranch;

export function isFlowSection(item: FlowOutlineItem): item is FlowSection {
  return 'kind' in item && item.kind === 'section';
}

export function isFlowBranch(item: FlowOutlineItem): item is FlowBranch {
  return 'kind' in item && item.kind === 'branch';
}

export function isFlowStep(item: FlowOutlineItem): item is FlowStep {
  return !isFlowSection(item) && !isFlowBranch(item);
}

export function getPlayableSteps(items: FlowOutlineItem[]): FlowStep[] {
  return items.filter(isFlowStep);
}

export interface FlowDocumentMetadata {
  createdAt: number;
  /** Legacy full user agent string. Prefer captureEnvironment.userAgent. */
  browser: string;
  /** Legacy platform string. Prefer captureEnvironment.platform. */
  platform: string;
  screen: { width: number; height: number };
  /** One-time capture context for the recording session. */
  captureEnvironment?: FlowCaptureEnvironment;
}

export interface FlowPayload {
  flow: {
    title: string;
    description: string;
    /** User-defined document version label (e.g. semver, release tag). */
    version: string;
    category: string;
    tags: string[];
  };
  metadata: FlowDocumentMetadata;
  steps: FlowOutlineItem[];
}
