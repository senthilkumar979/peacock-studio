import {
  createFlowStep,
  type FlowCaptureEnvironment,
  type FlowEvent,
  type FlowPayload,
} from '@peacock/shared';
import { getFinalCaptureEnvironment } from '../background/captureSession';
import { db } from '../storage/db';
import { blobToDataUrl } from './blobToDataUrl';

export interface PendingHandoff {
  payload: FlowPayload;
  screenshotUrls: Record<string, string>;
}

function getScreenshotId(event: FlowEvent): string {
  if (event.type === 'navigation') return '';
  if (event.type === 'page-view') return event.screenshotId;
  return event.screenshotId;
}

function getFlowTitle(events: FlowEvent[]): string {
  const first = events[0];
  if (!first) return 'Untitled Flow';
  if (first.type === 'navigation') return 'Recorded Flow';
  return first.title || 'Untitled Flow';
}

function buildMetadata(captureEnvironment: FlowCaptureEnvironment | null): FlowPayload['metadata'] {
  if (captureEnvironment) {
    return {
      createdAt: captureEnvironment.recordingStartedAt,
      browser: captureEnvironment.userAgent,
      platform: captureEnvironment.platform,
      screen: {
        width: captureEnvironment.screen.width,
        height: captureEnvironment.screen.height,
      },
      captureEnvironment,
    };
  }

  return {
    createdAt: Date.now(),
    browser: '',
    platform: '',
    screen: { width: 0, height: 0 },
  };
}

export async function buildPayloadFromRecording(): Promise<PendingHandoff> {
  const storedEvents = await db.events.orderBy('timestamp').toArray();
  const events = storedEvents.map((entry) => entry.data);
  const screenshots = await db.screenshots.toArray();
  const captureEnvironment = await getFinalCaptureEnvironment();

  const screenshotUrls: Record<string, string> = {};
  for (const screenshot of screenshots) {
    screenshotUrls[screenshot.id] = await blobToDataUrl(screenshot.blob);
  }

  const steps = events.map((event) => createFlowStep(event, getScreenshotId(event)));

  const payload: FlowPayload = {
    flow: {
      title: getFlowTitle(events),
      description: '',
      version: '1.0.0',
      category: '',
      tags: [],
    },
    metadata: buildMetadata(captureEnvironment),
    steps,
  };

  return { payload, screenshotUrls };
}
