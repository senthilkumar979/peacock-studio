export type { PageHintControl } from '@/components/onboarding/HintAnchor';
export { isPageHintActive } from '@/components/onboarding/HintAnchor';

/** @deprecated Use PageHintControl from HintAnchor */
export type EditorHintControl = import('@/components/onboarding/HintAnchor').PageHintControl;

/** @deprecated Use isPageHintActive */
export { isPageHintActive as isEditorHintActive } from '@/components/onboarding/HintAnchor';
