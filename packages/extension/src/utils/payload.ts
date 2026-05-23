import {
  createFlowStep,
  type FlowEvent,
  type FlowPayload,
} from '@peacock/shared';
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

export async function buildPayloadFromRecording(): Promise<PendingHandoff> {
  const storedEvents = await db.events.orderBy('timestamp').toArray();
  const events = storedEvents.map((entry) => entry.data);
  const screenshots = await db.screenshots.toArray();

  const screenshotUrls: Record<string, string> = {};
  for (const screenshot of screenshots) {
    screenshotUrls[screenshot.id] = await blobToDataUrl(screenshot.blob);
  }

  const steps = events.map((event) => createFlowStep(event, getScreenshotId(event)));

  const screenSize =
    typeof screen !== 'undefined'
      ? { width: screen.width, height: screen.height }
      : { width: 1920, height: 1080 };

  const payload: FlowPayload = {
    flow: {
      title: getFlowTitle(events),
      description: '',
      category: '',
      tags: [],
    },
    metadata: {
      createdAt: Date.now(),
      browser: navigator.userAgent,
      platform: navigator.platform,
      screen: screenSize,
    },
    steps,
  };

  return { payload, screenshotUrls };
}
