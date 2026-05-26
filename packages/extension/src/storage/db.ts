import Dexie, { type Table } from 'dexie';
import type { FlowEvent } from '@peacock/shared';

export interface StoredScreenshot {
  id: string;
  blob: Blob;
  tabId: number;
  timestamp: number;
}

export interface StoredCaptureResult {
  id: string;
  blob: Blob;
  mode: 'full-page' | 'visible' | 'selection';
  createdAt: number;
}

export interface StoredEvent {
  id: string;
  data: FlowEvent;
  timestamp: number;
}

class PeacockDB extends Dexie {
  screenshots!: Table<StoredScreenshot>;
  events!: Table<StoredEvent>;
  captures!: Table<StoredCaptureResult>;

  constructor() {
    super('PeacockDB');
    this.version(1).stores({
      screenshots: 'id, tabId, timestamp',
      events: 'id, timestamp',
    });
    this.version(2).stores({
      screenshots: 'id, tabId, timestamp',
      events: 'id, timestamp',
      captures: 'id, createdAt, mode',
    });
  }
}

export const db = new PeacockDB();

async function ensureDbOpen(): Promise<void> {
  if (!db.isOpen()) {
    await db.open();
  }
}

export async function addStoredEvent(event: FlowEvent): Promise<void> {
  await ensureDbOpen();
  await db.events.add({
    id: event.id,
    data: event,
    timestamp: event.timestamp,
  });
}

export async function getLatestStoredEvent(): Promise<FlowEvent | null> {
  await ensureDbOpen();
  const latest = await db.events.orderBy('timestamp').last();
  return latest?.data ?? null;
}

export async function putStoredEvent(event: FlowEvent): Promise<void> {
  await ensureDbOpen();
  await db.events.put({
    id: event.id,
    data: event,
    timestamp: event.timestamp,
  });
}

export async function clearRecordingData(): Promise<void> {
  await ensureDbOpen();
  await db.events.clear();
  await db.screenshots.clear();
}

export async function getEventCount(): Promise<number> {
  await ensureDbOpen();
  return db.events.count();
}

export async function saveCaptureResult(capture: StoredCaptureResult): Promise<void> {
  await ensureDbOpen();
  await db.captures.put(capture);
}

export async function getCaptureResult(id: string): Promise<StoredCaptureResult | undefined> {
  await ensureDbOpen();
  return db.captures.get(id);
}

export async function deleteCaptureResult(id: string): Promise<void> {
  await ensureDbOpen();
  await db.captures.delete(id);
}
