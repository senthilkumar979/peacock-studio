import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

const PDF_RENDER_TIMEOUT_MS = 30_000;

export async function renderPdfBlob(
  document: ReactElement<DocumentProps>,
): Promise<Blob> {
  const instance = pdf();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    await new Promise<void>((resolve, reject) => {
      const finish = () => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        instance.removeListener('change', onChange);
        resolve();
      };

      const onChange = () => {
        if (instance.container.document) finish();
      };

      timeoutId = setTimeout(() => {
        instance.removeListener('change', onChange);
        reject(new Error('PDF render timed out'));
      }, PDF_RENDER_TIMEOUT_MS);

      instance.on('change', onChange);
      instance.updateContainer(document);

      queueMicrotask(() => {
        if (instance.container.document) finish();
      });
    });

    return instance.toBlob();
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
