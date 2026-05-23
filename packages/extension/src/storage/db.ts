import Dexie, { type Table } from 'dexie';
import type { FlowEvent } from '@peacock/shared';

export interface StoredScreenshot {
  id: string;
  blob: Blob;
  tabId: number;
  timestamp: number;
}

export interface StoredEvent {
  id: string;
  data: FlowEvent;
  timestamp: number;
}

class PeacockDB extends Dexie {
  screenshots!: Table<StoredScreenshot>;
  events!: Table<StoredEvent>;

  constructor() {
    super('PeacockDB');
    this.version(1).stores({
      screenshots: 'id, tabId, timestamp',
      events: 'id, timestamp',
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

export async function clearRecordingData(): Promise<void> {
  await ensureDbOpen();
  await db.events.clear();
  await db.screenshots.clear();
}

export async function getEventCount(): Promise<number> {
  await ensureDbOpen();
  return db.events.count();
}
