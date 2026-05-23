import {
  ALLOWED_STEP_IMAGE_EXTENSIONS,
  ALLOWED_STEP_IMAGE_MIME_TYPES,
  MAX_STEP_IMAGE_BYTES,
} from '@/constants/stepImageUpload';

export function isAllowedStepImageFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasAllowedExtension = ALLOWED_STEP_IMAGE_EXTENSIONS.includes(
    extension as (typeof ALLOWED_STEP_IMAGE_EXTENSIONS)[number]
  );
  const hasAllowedMime = ALLOWED_STEP_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_STEP_IMAGE_MIME_TYPES)[number]
  );

  return hasAllowedExtension || hasAllowedMime;
}

export function readStepImageDataUrl(file: File): Promise<string> {
  if (!isAllowedStepImageFile(file)) {
    return Promise.reject(new Error('Only JPEG, JPG, PNG, and SVG images are allowed.'));
  }

  if (file.size > MAX_STEP_IMAGE_BYTES) {
    return Promise.reject(new Error('Image must be 5 MB or smaller.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read image file.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}
