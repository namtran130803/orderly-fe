/** Cấu hình từ .env (build-time). */
const key = import.meta.env.VITE_PUSHER_KEY as string | undefined;
const directHost =
  (import.meta.env.VITE_PUSHER_HOST as string | undefined) ?? '127.0.0.1';
const directPort = Number(import.meta.env.VITE_PUSHER_PORT ?? 6001);
const directForceTLS =
  import.meta.env.VITE_PUSHER_FORCE_TLS === 'true' ||
  import.meta.env.VITE_PUSHER_FORCE_TLS === '1';

/**
 * Dev: FE chạy HTTPS → WebSocket phải qua WSS cùng origin (Vite proxy /app → Soketi).
 * Tắt: VITE_PUSHER_USE_VITE_PROXY=false và trỏ HOST/PORT thẳng Soketi (chỉ khi FE http).
 */
const useViteProxy =
  import.meta.env.VITE_PUSHER_USE_VITE_PROXY !== 'false';

export function isRealtimeEnabled(): boolean {
  return Boolean(key?.trim());
}

export type PusherEndpointConfig = {
  key: string;
  wsHost: string;
  wsPort: number;
  wssPort: number;
  forceTLS: boolean;
  wsPath: string;
};

export function resolvePusherEndpoints(): PusherEndpointConfig | null {
  if (!isRealtimeEnabled()) return null;

  if (useViteProxy && typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    const fallbackPort = Number(import.meta.env.VITE_PUSHER_WS_PORT ?? 5173);
    const parsedPort = port ? Number(port) : fallbackPort;
    const tls = protocol === 'https:';
    return {
      key: key!,
      wsHost: hostname,
      wsPort: parsedPort,
      wssPort: parsedPort,
      forceTLS: tls,
      // Pusher tự thêm /app/{key} — không set wsPath='/app' (tránh /app/app/...)
      wsPath: '',
    };
  }

  return {
    key: key!,
    wsHost: directHost,
    wsPort: directPort,
    wssPort: directPort,
    forceTLS: directForceTLS,
    wsPath: '',
  };
}
