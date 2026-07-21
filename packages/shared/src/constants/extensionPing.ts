export const EXTENSION_PING_REQUEST = 'PEACOCK_EXTENSION_PING' as const;
export const EXTENSION_PING_RESPONSE = 'PEACOCK_EXTENSION_PONG' as const;

export interface ExtensionPingRequestMessage {
  type: typeof EXTENSION_PING_REQUEST;
}

export interface ExtensionPingResponseMessage {
  type: typeof EXTENSION_PING_RESPONSE;
  ok: true;
}
