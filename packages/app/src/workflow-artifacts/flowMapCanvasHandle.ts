export interface FlowMapCanvasHandle {
  downloadPng: (filename: string) => Promise<void>;
}
