import type { ExtensionMessage } from '@peacock/shared';

export function sendExtensionMessage<T>(message: ExtensionMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: T & { error?: string }) => {
      const lastError = chrome.runtime.lastError?.message;
      if (lastError) {
        reject(new Error(lastError));
        return;
      }

      if (response && typeof response === 'object' && 'error' in response && response.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response);
    });
  });
}
