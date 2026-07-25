import { MAX_IMAGE_BYTES } from '@peacock/shared';

export const ALLOWED_STEP_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'svg'] as const;

export const ALLOWED_STEP_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'] as const;

export const STEP_IMAGE_ACCEPT = '.jpeg,.jpg,.png,.svg,image/jpeg,image/png,image/svg+xml';

export const MAX_STEP_IMAGE_BYTES = MAX_IMAGE_BYTES;
