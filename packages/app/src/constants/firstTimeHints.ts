const STORAGE_KEY = 'peacock-first-time-hints';

function readDismissedHints(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeDismissedHints(hints: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hints));
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function isFirstTimeHintDismissed(hintId: string): boolean {
  return Boolean(readDismissedHints()[hintId]);
}

export function dismissFirstTimeHint(hintId: string): void {
  const hints = readDismissedHints();
  hints[hintId] = true;
  writeDismissedHints(hints);
}

export const DASHBOARD_HINT_IDS = {
  library: 'dashboard-library',
  productTours: 'dashboard-product-tours',
  recordFlow: 'dashboard-record-flow',
} as const;

export const EDITOR_HINT_IDS = {
  stepList: 'editor-step-list',
  addStep: 'editor-add-step',
  addSection: 'editor-add-section',
  addBranching: 'editor-add-branching',
  canvas: 'editor-canvas',
  stepPanel: 'editor-step-panel',
  flowDetails: 'editor-flow-details',
  play: 'editor-play',
} as const;

export const EDITOR_HINT_SEQUENCE = [
  EDITOR_HINT_IDS.stepList,
  EDITOR_HINT_IDS.addStep,
  EDITOR_HINT_IDS.addSection,
  EDITOR_HINT_IDS.addBranching,
  EDITOR_HINT_IDS.canvas,
  EDITOR_HINT_IDS.stepPanel,
  EDITOR_HINT_IDS.flowDetails,
  EDITOR_HINT_IDS.play,
] as const;

export function getEditorHintSequence(options: {
  canBranch: boolean;
  canPlay: boolean;
  canUseToolbarActions: boolean;
}): readonly string[] {
  return EDITOR_HINT_SEQUENCE.filter((hintId) => {
    if (hintId === EDITOR_HINT_IDS.addBranching && !options.canBranch) return false;
    if (hintId === EDITOR_HINT_IDS.play && !options.canPlay) return false;
    if (hintId === EDITOR_HINT_IDS.flowDetails && !options.canUseToolbarActions) return false;
    return true;
  });
}

export const PLAYER_HINT_IDS = {
  viewToggle: 'player-view-toggle',
  playerControls: 'player-controls',
  docOutline: 'player-doc-outline',
  editFlow: 'player-edit-flow',
} as const;

export const PRODUCT_TOUR_HINT_IDS = {
  persona: 'product-tour-persona',
  details: 'product-tour-details',
  features: 'product-tour-features',
  addFeature: 'product-tour-add-feature',
  overview: 'product-tour-overview',
  completionCta: 'product-tour-completion-cta',
  preview: 'product-tour-preview',
  status: 'product-tour-status',
} as const;

export const PRODUCT_TOUR_LEARNER_HINT_IDS = {
  overview: 'product-tour-learner-overview',
  navigation: 'product-tour-learner-navigation',
  editTour: 'product-tour-learner-edit',
} as const;

export const DASHBOARD_HINT_SEQUENCE = [
  DASHBOARD_HINT_IDS.library,
  DASHBOARD_HINT_IDS.productTours,
  DASHBOARD_HINT_IDS.recordFlow,
] as const;

export const PRODUCT_TOUR_HINT_SEQUENCE = [
  PRODUCT_TOUR_HINT_IDS.persona,
  PRODUCT_TOUR_HINT_IDS.details,
  PRODUCT_TOUR_HINT_IDS.features,
  PRODUCT_TOUR_HINT_IDS.addFeature,
  PRODUCT_TOUR_HINT_IDS.overview,
  PRODUCT_TOUR_HINT_IDS.completionCta,
  PRODUCT_TOUR_HINT_IDS.preview,
  PRODUCT_TOUR_HINT_IDS.status,
] as const;

export const PRODUCT_TOUR_LEARNER_HINT_SEQUENCE = [
  PRODUCT_TOUR_LEARNER_HINT_IDS.overview,
  PRODUCT_TOUR_LEARNER_HINT_IDS.navigation,
  PRODUCT_TOUR_LEARNER_HINT_IDS.editTour,
] as const;

export function getPlayerHintSequence(
  viewMode: 'doc' | 'player',
): readonly string[] {
  return [
    PLAYER_HINT_IDS.viewToggle,
    viewMode === 'player'
      ? PLAYER_HINT_IDS.playerControls
      : PLAYER_HINT_IDS.docOutline,
    PLAYER_HINT_IDS.editFlow,
  ];
}

export function getProductTourLearnerHintSequence(options: {
  canEdit: boolean;
}): readonly string[] {
  if (!options.canEdit) {
    return PRODUCT_TOUR_LEARNER_HINT_SEQUENCE.filter(
      (hintId) => hintId !== PRODUCT_TOUR_LEARNER_HINT_IDS.editTour,
    );
  }
  return PRODUCT_TOUR_LEARNER_HINT_SEQUENCE;
}

export type DashboardHintId = (typeof DASHBOARD_HINT_IDS)[keyof typeof DASHBOARD_HINT_IDS];
export type EditorHintId = (typeof EDITOR_HINT_IDS)[keyof typeof EDITOR_HINT_IDS];
export type PlayerHintId = (typeof PLAYER_HINT_IDS)[keyof typeof PLAYER_HINT_IDS];
export type ProductTourHintId =
  (typeof PRODUCT_TOUR_HINT_IDS)[keyof typeof PRODUCT_TOUR_HINT_IDS];
export type ProductTourLearnerHintId =
  (typeof PRODUCT_TOUR_LEARNER_HINT_IDS)[keyof typeof PRODUCT_TOUR_LEARNER_HINT_IDS];

export function getNextHintInSequence(
  hintIds: readonly string[],
): string | null {
  for (const hintId of hintIds) {
    if (!isFirstTimeHintDismissed(hintId)) return hintId;
  }
  return null;
}

export function getHintStepLabel(
  hintId: string,
  sequence: readonly string[],
): string {
  const index = sequence.indexOf(hintId);
  if (index === -1) return 'Quick tip';
  return `Tip ${index + 1} of ${sequence.length}`;
}

export function getNextDashboardHintId(options: {
  isLibraryLoading: boolean;
  hasDocuments: boolean;
}): DashboardHintId | null {
  if (options.isLibraryLoading) return null;

  const sequence = options.hasDocuments
    ? DASHBOARD_HINT_SEQUENCE.filter((id) => id !== DASHBOARD_HINT_IDS.recordFlow)
    : DASHBOARD_HINT_SEQUENCE;

  return getNextHintInSequence(sequence) as DashboardHintId | null;
}
