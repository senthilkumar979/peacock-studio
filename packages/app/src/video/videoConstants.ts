export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_ZOOM_SCALE = 1.55;
export const VIDEO_ORIGIN_CLAMP_MIN = 0.15;
export const VIDEO_ORIGIN_CLAMP_MAX = 0.85;

export const COVER_FRAMES = 90;
export const END_FRAMES = 90;
export const NAV_FRAMES = 75;

export const MARKER_HOLD_IN_FRAMES = 15;
export const MARKER_ZOOM_IN_FRAMES = 18;
export const MARKER_HOLD_FRAMES = 48;
export const MARKER_ZOOM_OUT_FRAMES = 24;

export const MARKER_TOTAL_FRAMES =
  MARKER_HOLD_IN_FRAMES +
  MARKER_ZOOM_IN_FRAMES +
  MARKER_HOLD_FRAMES +
  MARKER_ZOOM_OUT_FRAMES;

/**
 * Phase 1 embeds `@remotion/player` only (no `renderMediaOnWeb`, no MP4).
 * Companies with 4+ personnel may need a Remotion Company License (Automators)
 * to ship the Player in a SaaS: https://www.remotion.dev/docs/license
 * Do not put Remotion license secrets in `VITE_` variables.
 */
export const REMOTION_PLAYER_EMBEDDING_NOTE =
  'Watch-only Remotion Player. Confirm company license if the org has 4+ people.';
