import type { ElementSnapshot, FlowEvent } from '../types/events';
import { formatVisibleLabel, humanizeIdentifier, sentenceCase } from './humanize';

function getVisibleLabel(snapshot: ElementSnapshot): string {
  if (snapshot.innerText) return formatVisibleLabel(snapshot.innerText);
  if (snapshot.label.text) return formatVisibleLabel(snapshot.label.text);
  if (snapshot.label.ariaLabel) return formatVisibleLabel(snapshot.label.ariaLabel);
  if (snapshot.label.placeholder) return formatVisibleLabel(snapshot.label.placeholder);
  if (snapshot.name) return humanizeIdentifier(snapshot.name);
  if (snapshot.id) return humanizeIdentifier(snapshot.id);
  return snapshot.tagName;
}

function findDataAttribute(
  snapshot: ElementSnapshot,
  key: string
): string | undefined {
  const lowerKey = key.toLowerCase();

  const fromElement = Object.entries(snapshot.dataAttributes).find(
    ([attrKey]) => attrKey.toLowerCase() === lowerKey
  );
  if (fromElement) return fromElement[1];

  const fromParent = snapshot.parent
    ? Object.entries(snapshot.parent.dataAttributes).find(
        ([attrKey]) => attrKey.toLowerCase() === lowerKey
      )
    : undefined;
  if (fromParent) return fromParent[1];

  const fromGrandparent = snapshot.grandparent
    ? Object.entries(snapshot.grandparent.dataAttributes).find(
        ([attrKey]) => attrKey.toLowerCase() === lowerKey
      )
    : undefined;

  return fromGrandparent?.[1];
}

function getFormContextHint(snapshot: ElementSnapshot): string {
  const parentIsForm = snapshot.parent?.tagName === 'form';
  const grandparentIsForm = snapshot.grandparent?.tagName === 'form';
  const hasFormName = Boolean(snapshot.parent?.name || snapshot.grandparent?.name);

  if (parentIsForm || grandparentIsForm || hasFormName) {
    return ' to save the form';
  }

  return '';
}

function getFieldName(snapshot: ElementSnapshot): string {
  if (snapshot.label.text) return sentenceCase(snapshot.label.text);
  if (snapshot.name) return sentenceCase(snapshot.name);
  if (snapshot.id) return sentenceCase(snapshot.id);
  if (snapshot.label.placeholder) return sentenceCase(snapshot.label.placeholder);
  return 'field';
}

function getRecordedValue(snapshot: ElementSnapshot, event: FlowEvent): string | null {
  if (event.type === 'input' && event.valuePreview) return event.valuePreview;
  return snapshot.valuePreview;
}

function formatValuePhrase(value: string | null): string {
  if (!value) return '';
  return ` "${value}"`;
}

function getPageContext(event: FlowEvent): string {
  if (event.type === 'navigation' || event.type === 'page-view') return '';
  const title = formatVisibleLabel(event.title);
  return title ? `On the ${title} page, ` : 'On the current page, ';
}

function getPageViewName(event: Extract<FlowEvent, { type: 'page-view' }>): string {
  const title = formatVisibleLabel(event.title);
  return title || 'page';
}

export function generateStepTitle(snapshot: ElementSnapshot, event: FlowEvent): string {
  if (event.type === 'navigation') {
    return 'Go to next page';
  }

  if (event.type === 'page-view') {
    return `Open ${getPageViewName(event)}`;
  }

  const label = getVisibleLabel(snapshot);
  const value = getRecordedValue(snapshot, event);

  if (snapshot.isButton) {
    return `Click ${label}`;
  }

  if (snapshot.isLink) {
    return `Open ${label} link`;
  }

  if (snapshot.isSelect) {
    return value ? `Select ${getFieldName(snapshot)}: ${value}` : `Select ${getFieldName(snapshot)}`;
  }

  if (snapshot.isCheckbox || snapshot.isRadio) {
    return `Choose ${sentenceCase(label)}`;
  }

  if (snapshot.isInput) {
    return value ? `Enter ${getFieldName(snapshot)}: ${value}` : `Enter ${getFieldName(snapshot)}`;
  }

  return `Click ${sentenceCase(label)}`;
}

export function generateStepDescription(snapshot: ElementSnapshot, event: FlowEvent): string {
  if (event.type === 'navigation') {
    return `Navigate from ${event.fromUrl} to ${event.toUrl}.`;
  }

  if (event.type === 'page-view') {
    return `Open ${getPageViewName(event)} at ${event.url}.`;
  }

  const pageContext = getPageContext(event);

  if (snapshot.isButton) {
    const label = getVisibleLabel(snapshot);
    const formHint = getFormContextHint(snapshot);
    return `${pageContext}click the ${label} button${formHint}.`;
  }

  if (snapshot.isLink) {
    const label = getVisibleLabel(snapshot);
    return `${pageContext}open the ${label} link.`;
  }

  if (snapshot.isSelect) {
    const fieldName = getFieldName(snapshot);
    const value = getRecordedValue(snapshot, event);
    const country = findDataAttribute(snapshot, 'country');

    if (value && country) {
      return `${pageContext}select${formatValuePhrase(value)} in the ${fieldName} field for country ${country}.`;
    }

    if (value) {
      return `${pageContext}select${formatValuePhrase(value)} in the ${fieldName} field.`;
    }

    if (country) {
      return `${pageContext}select a value in the ${fieldName} field for country ${country}.`;
    }

    return `${pageContext}select a value in the ${fieldName} field.`;
  }

  if (snapshot.isInput || snapshot.tagName === 'textarea') {
    const fieldName = getFieldName(snapshot);
    const value = getRecordedValue(snapshot, event);
    const country = findDataAttribute(snapshot, 'country');
    const valuePhrase = formatValuePhrase(value);

    if (country && value) {
      return `${pageContext}enter${valuePhrase} in the ${fieldName} field for country ${country}.`;
    }

    if (country) {
      return `${pageContext}enter a value in the ${fieldName} field for country ${country}.`;
    }

    if (value) {
      return `${pageContext}enter${valuePhrase} in the ${fieldName} field.`;
    }

    return `${pageContext}enter a value in the ${fieldName} field.`;
  }

  if (snapshot.isCheckbox) {
    const label = sentenceCase(getVisibleLabel(snapshot));
    const value = getRecordedValue(snapshot, event);
    if (value) {
      return `${pageContext}choose the ${label} checkbox (${value}).`;
    }
    return `${pageContext}choose the ${label} checkbox.`;
  }

  if (snapshot.isRadio) {
    const label = sentenceCase(getVisibleLabel(snapshot));
    const value = getRecordedValue(snapshot, event);
    if (value) {
      return `${pageContext}choose the ${label} option (${value}).`;
    }
    return `${pageContext}choose the ${label} option.`;
  }

  const label = sentenceCase(getVisibleLabel(snapshot));
  const role = snapshot.role ?? snapshot.tagName;
  return `${pageContext}click the ${role} "${label}".`;
}

export function enrichStepFromEvent(
  step: { title: string; notes: string; generatedTitle: string; generatedDescription: string },
  event: FlowEvent
): void {
  if (event.type === 'navigation') {
    step.generatedTitle = generateStepTitle({} as ElementSnapshot, event);
    step.generatedDescription = generateStepDescription({} as ElementSnapshot, event);
    step.title = step.generatedTitle;
    step.notes = step.generatedDescription;
    return;
  }

  if (event.type === 'page-view') {
    step.generatedTitle = generateStepTitle({} as ElementSnapshot, event);
    step.generatedDescription = generateStepDescription({} as ElementSnapshot, event);
    step.title = step.generatedTitle;
    step.notes = step.generatedDescription;
    return;
  }

  const { element } = event;
  step.generatedTitle = generateStepTitle(element, event);
  step.generatedDescription = generateStepDescription(element, event);
  step.title = step.generatedTitle;
  step.notes = step.generatedDescription;
}
