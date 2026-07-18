import type { FlowCaptureEnvironment } from '@peacock/shared';
import { formatCaptureDuration } from '@peacock/shared';

export interface CaptureHighlight {
  id: string;
  label: string;
  value: string;
  detail?: string;
}

export interface CaptureDetailGroup {
  id: string;
  title: string;
  items: { label: string; value: string }[];
}

function formatVersion(version: string | null): string {
  return version ? ` ${version}` : '';
}

export function buildCaptureHighlights(
  environment: FlowCaptureEnvironment,
): CaptureHighlight[] {
  return [
    {
      id: 'os',
      label: 'Operating system',
      value: environment.os.name,
      detail: environment.os.version ?? undefined,
    },
    {
      id: 'browser',
      label: 'Browser',
      value: environment.browser.name,
      detail: environment.browser.version ?? undefined,
    },
    {
      id: 'duration',
      label: 'Capture time',
      value: formatCaptureDuration(environment.durationMs),
    },
  ];
}

export function buildCaptureDetailGroups(
  environment: FlowCaptureEnvironment,
): CaptureDetailGroup[] {
  const viewport = `${environment.viewport.width} × ${environment.viewport.height}`;

  return [
    {
      id: 'system',
      title: 'System details',
      items: [
        {
          label: 'OS',
          value: `${environment.os.name}${formatVersion(environment.os.version)}`,
        },
        {
          label: 'Browser',
          value: `${environment.browser.name}${formatVersion(environment.browser.version)}`,
        },
        { label: 'Locale', value: environment.locale },
        { label: 'Viewport', value: viewport },
      ],
    },
  ];
}
