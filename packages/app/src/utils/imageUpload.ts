const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/svg+xml']);
const ALLOWED_EXTENSION = /\.(jpe?g|png|svg)$/i;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const STEP_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml';

export function isAllowedStepImage(file: File): boolean {
  if (file.size > MAX_IMAGE_BYTES) return false;
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  return ALLOWED_EXTENSION.test(file.name);
}

export function getStepImageValidationError(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 10 MB or smaller.';
  }
  if (!isAllowedStepImage(file)) {
    return 'Only JPEG, PNG, and SVG files are allowed.';
  }
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Could not read image file.'));
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}
