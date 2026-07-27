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

/**
 * Renders a URL as a compact, human-friendly location: the host plus a short
 * path (e.g. `example.com/checkout`). Falls back to the raw string if parsing
 * fails so we never surface an empty description.
 */
function formatLocation(url: string): string {
  if (!url) return 'the previous page';

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '');
    return path && path !== '/' ? `${parsed.host}${path}` : parsed.host;
  } catch {
    return url;
  }
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

function titleForCheckbox(
  labels: ReturnType<typeof resolveStepLabels>,
  snapshot: ElementSnapshot,
  event: FlowEvent,
): string {
  if (event.type === 'input' && !labels.value) {
    return `Uncheck ${labels.target}`;
  }
  if (!snapshot.isCheckbox && !labels.value) {
    return `Uncheck ${labels.target}`;
  }
  return `Check ${labels.target}`;
}

function titleForRadio(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Select ${labels.target}`;
}

function titleForTab(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Switch to ${labels.target}`;
}

function titleForMenuItem(labels: ReturnType<typeof resolveStepLabels>): string {
  return `Click ${labels.target}`;
}

function titleForCombobox(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  return `Open ${field}`;
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

function descriptionForCheckbox(
  labels: ReturnType<typeof resolveStepLabels>,
  event: FlowEvent,
): string {
  const prefix = formatPagePrefix(labels.pageTitle);
  if (event.type === 'input' && !labels.value) {
    return `${prefix}uncheck ${labels.target}.`;
  }
  return `${prefix}check ${labels.target}.`;
}

function titleForSubmit(snapshot: ElementSnapshot): string {
  const formName =
    snapshot.name ||
    snapshot.label.text ||
    snapshot.label.ariaLabel ||
    snapshot.id ||
    'form';
  return `Submit ${formName}`;
}

function descriptionForSubmit(snapshot: ElementSnapshot, labels: ReturnType<typeof resolveStepLabels>): string {
  const prefix = formatPagePrefix(labels.pageTitle);
  const formName = snapshot.name || snapshot.label.text || 'the form';
  return `${prefix}press Enter to submit ${formName}.`;
}

function descriptionForRadio(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}select ${labels.target}.`;
}

function descriptionForTab(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}switch to the ${labels.target} tab.`;
}

function descriptionForMenuItem(labels: ReturnType<typeof resolveStepLabels>): string {
  return `${formatPagePrefix(labels.pageTitle)}click ${labels.target}.`;
}

function descriptionForCombobox(labels: ReturnType<typeof resolveStepLabels>): string {
  const field = labels.field ?? 'field';
  return `${formatPagePrefix(labels.pageTitle)}open the ${field} dropdown.`;
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

  if (event.type === 'submit') {
    return titleForSubmit(snapshot);
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
    case 'option':
      return titleForSelect(labels);
    case 'checkbox':
      return titleForCheckbox(labels, snapshot, event);
    case 'radio':
      return titleForRadio(labels);
    case 'tab':
      return titleForTab(labels);
    case 'menuitem':
      return titleForMenuItem(labels);
    case 'combobox':
      return titleForCombobox(labels);
    default:
      return titleForGeneric(labels);
  }
}

export function generateStepDescription(snapshot: ElementSnapshot, event: FlowEvent): string {
  if (event.type === 'navigation') {
    return `Navigate from ${formatLocation(event.fromUrl)} to ${formatLocation(event.toUrl)}.`;
  }

  if (event.type === 'page-view') {
    if (event.navigationRedirect) {
      return `After previous action, page is redirected to ${getNavigationRedirectPageName(event)}`;
    }
    return `Open the ${getPageViewName(event)} page.`;
  }

  if (event.type === 'submit') {
    return descriptionForSubmit(snapshot, resolveStepLabels(snapshot, event));
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
    case 'option':
      return descriptionForSelect(labels);
    case 'checkbox':
      return descriptionForCheckbox(labels, event);
    case 'radio':
      return descriptionForRadio(labels);
    case 'tab':
      return descriptionForTab(labels);
    case 'menuitem':
      return descriptionForMenuItem(labels);
    case 'combobox':
      return descriptionForCombobox(labels);
    default:
      return descriptionForGeneric(labels);
  }
}

export function enrichStepFromEvent(
  step: { title: string; notes: string; generatedTitle: string; generatedDescription: string },
  event: FlowEvent,
): void {
  const snapshot =
    event.type === 'click' || event.type === 'input' || event.type === 'submit'
      ? event.element
      : ({} as ElementSnapshot);

  step.generatedTitle = generateStepTitle(snapshot, event);
  step.generatedDescription = generateStepDescription(snapshot, event);
  step.title = step.generatedTitle;
  step.notes = '';
}
