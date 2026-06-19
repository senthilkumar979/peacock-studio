export const CAPTURE_FIELD_TOOLTIPS: Record<string, string> = {
  'Screen size':
    'The full resolution of the display in pixels (width × height), including the entire monitor or screen.',
  Viewport:
    'The visible area inside the browser window where the page was shown when captured, excluding browser chrome like tabs and toolbars.',
  'Available area':
    'The screen space available to apps in pixels (width × height), excluding OS elements such as the taskbar, menu bar, or dock.',
};

export function getCaptureFieldTooltip(label: string): string | undefined {
  return CAPTURE_FIELD_TOOLTIPS[label];
}
