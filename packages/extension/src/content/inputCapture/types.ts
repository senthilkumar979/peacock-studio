export type RecordableInputTarget =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLElement;

export interface InputCaptureDeps {
  isRecordingActive: () => boolean;
  storeEvent: (event: import('@peacock/shared').FlowEvent) => Promise<void>;
  captureScreenshotId: () => Promise<string>;
  isPeacockUi: (target: EventTarget | null) => boolean;
}
