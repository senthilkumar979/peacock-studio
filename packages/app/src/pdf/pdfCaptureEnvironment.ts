import type { FlowCaptureEnvironment } from '@peacock/shared';

export function hasPdfCaptureEnvironment(
  environment: FlowCaptureEnvironment | undefined,
): environment is FlowCaptureEnvironment {
  if (!environment) return false;

  return Boolean(
    environment.userAgent &&
      environment.os?.name &&
      environment.browser?.name &&
      environment.screen?.width &&
      environment.viewport?.width,
  );
}
