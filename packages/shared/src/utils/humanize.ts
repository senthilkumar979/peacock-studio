export function formatVisibleLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  return trimmed
    .replace(/&/g, ' and ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function humanizeIdentifier(value: string): string {
  const formatted = formatVisibleLabel(value);
  if (!formatted) return '';

  return formatted.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sentenceCase(value: string): string {
  const humanized = humanizeIdentifier(value);
  if (!humanized) return '';
  return humanized.charAt(0).toUpperCase() + humanized.slice(1).toLowerCase();
}
