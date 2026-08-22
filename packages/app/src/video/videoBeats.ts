export interface VideoMarker {
  x: number;
  y: number;
}

export interface VideoBeat {
  kind: 'step' | 'nav';
  stepNumber: number;
  title: string;
  description: string;
  screenshotUrl: string | null;
  marker: VideoMarker | null;
  url: string;
}

export interface FlowVideoCompositionProps {
  beats: VideoBeat[];
  title: string;
  description: string;
  version: string;
  logoUrl: string;
  primaryColor: string;
  appName: string;
}
