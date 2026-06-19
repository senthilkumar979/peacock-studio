import type { ElementSnapshot, FlowEvent } from '../types/events';
import {
  formatContextSuffix,
  formatPagePrefix,
  getControlKind,
  isInsideForm,
  isSubmitButton,
  resolveStepLabels,
} from './stepDescriptionLabels';

function getPageViewName(event: Extract<FlowEvent, { type: 'page-view' }>): string {
  const title = event.title.trim();
  return title || 'page';
}

function getNavigationRedirectPageName(event: Extract<FlowEvent, { type: 'page-view' }>): string {
  const title = event.title.trim();
  return title || 'the new page';
}

function titleForButton(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Click ${labels.target}`;
}

function titleForLink(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Open ${labels.target}`;
}

function titleForTextInput(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  if (labels.value) return `Enter ${labels.value} in ${field}`;
  return `Fill in ${field}`;
}

function titleForSelect(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  if (labels.value) return `Select ${labels.value} for ${field}`;
  return `Select ${field}`;
}

function titleForCheckbox(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Check ${labels.target}`;
}

function titleForRadio(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Select ${labels.target}`;
}

function titleForGeneric(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Click ${labels.target}`;
}

function descriptionForButton(
  snapshot: ElementSnapshot,
  labels: ReturnType<typeof resolveStepLabels>,
): string {
  const prefix = formatPagePrefix(labels.pageTitle);
  const submitHint =
    isSubmitButton(snapshot) && isInsideForm(snapshot) ? ' to save the form' : '';
  return `${prefix}click ${labels.target}${submitHint}.`;
}

function descriptionForLink(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}open ${labels.target}.`;
}

function descriptionForTextInput(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  const suffix = formatContextSuffix(labels.contextHint);
  const prefix = formatPagePrefix(labels.pageTitle);

  if (labels.value) {
    return `${prefix}enter ${labels.value} in the ${field} field${suffix}.`;
  }

  return `${prefix}enter a value in the ${field} field${suffix}.`;
}

function descriptionForSelect(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  const suffix = formatContextSuffix(labels.contextHint);
  const prefix = formatPagePrefix(labels.pageTitle);

  if (labels.value) {
    return `${prefix}select ${labels.value} from the ${field} dropdown${suffix}.`;
  }

  return `${prefix}choose an option from the ${field} dropdown${suffix}.`;
}

function descriptionForCheckbox(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}check ${labels.target}.`;
}

function descriptionForRadio(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}select ${labels.target}.`;
}

function descriptionForGeneric(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}click ${labels.target}.`;
}

export function generateStepTitle(snapshot: ElementSnapshot, event: FlowEvent): string {
  if (event.type === 'navigation') {
    return 'Go to next page';
  }

  if (event.type === 'page-view') {
    if (event.navigationRedirect) {
      return `User navigates to ${getNavigationRedirectPageName(event)} page`;
    }
    return `Open ${getPageViewName(event)}`;
  }

  const labels = resolveStepLabels(snapshot, event);

  switch (getControlKind(snapshot)) {
    case 'button':
      return titleForButton(labels);
    case 'link':
      return titleForLink(labels);
    case 'text-input':
    case 'textarea':
      return titleForTextInput(labels);
    case 'select':
      return titleForSelect(labels);
    case 'checkbox':
      return titleForCheckbox(labels);
    case 'radio':
      return titleForRadio(labels);
    default:
      return titleForGeneric(labels);
  }
}

export function generateStepDescription(snapshot: ElementSnapshot, event: FlowEvent): string {
  if (event.type === 'navigation') {
    return `Navigate from ${event.fromUrl} to ${event.toUrl}.`;
  }

  if (event.type === 'page-view') {
    if (event.navigationRedirect) {
      return `After previous action, page is redirected to ${getNavigationRedirectPageName(event)}`;
    }
    return `Open the ${getPageViewName(event)} page.`;
  }

  const labels = resolveStepLabels(snapshot, event);

  switch (getControlKind(snapshot)) {
    case 'button':
      return descriptionForButton(snapshot, labels);
    case 'link':
      return descriptionForLink(labels);
    case 'text-input':
    case 'textarea':
      return descriptionForTextInput(labels);
    case 'select':
      return descriptionForSelect(labels);
    case 'checkbox':
      return descriptionForCheckbox(labels);
    case 'radio':
      return descriptionForRadio(labels);
    default:
      return descriptionForGeneric(labels);
  }
}

export function enrichStepFromEvent(
  step: { title: string; notes: string; generatedTitle: string; generatedDescription: string },
  event: FlowEvent,
): void {
  const snapshot = event.type === 'click' || event.type === 'input' ? event.element : ({} as ElementSnapshot);

  step.generatedTitle = generateStepTitle(snapshot, event);
  step.generatedDescription = generateStepDescription(snapshot, event);
  step.title = step.generatedTitle;
  step.notes = '';
}
