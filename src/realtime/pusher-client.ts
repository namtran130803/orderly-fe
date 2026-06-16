import Pusher, { type Channel } from 'pusher-js';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import {
  REALTIME_EVENTS,
  storeOrdersChannel,
  type OrderRealtimePayload,
  type SubscriptionRealtimePayload,
} from '@/realtime/constants';
import { isRealtimeEnabled, resolvePusherEndpoints } from '@/realtime/config';

type OrderChangedHandler = (payload: OrderRealtimePayload) => void;
type SubscriptionPaymentPaidHandler = (
  payload: SubscriptionRealtimePayload,
) => void;

let sharedClient: Pusher | null = null;

function parseAuthResponse(data: unknown): { auth: string } | null {
  if (!data || typeof data !== 'object') return null;
  const raw = data as Record<string, unknown>;
  if (typeof raw.auth === 'string') return { auth: raw.auth };
  const nested = raw.data;
  if (
    nested &&
    typeof nested === 'object' &&
    typeof (nested as { auth?: string }).auth === 'string'
  ) {
    return { auth: (nested as { auth: string }).auth };
  }
  return null;
}

function resetSharedClient(): void {
  if (sharedClient) {
    sharedClient.disconnect();
    sharedClient = null;
  }
}

function getOrCreateClient(): Pusher | null {
  if (!isRealtimeEnabled()) return null;

  const endpoints = resolvePusherEndpoints();
  if (!endpoints) return null;

  if (sharedClient) {
    const state = sharedClient.connection.state;
    if (state === 'failed') {
      resetSharedClient();
    } else {
      return sharedClient;
    }
  }

  sharedClient = new Pusher(endpoints.key, {
    cluster: 'mt1',
    wsHost: endpoints.wsHost,
    wsPort: endpoints.wsPort,
    wssPort: endpoints.wssPort,
    wsPath: endpoints.wsPath,
    forceTLS: endpoints.forceTLS,
    // forceTLS + wss: phải dùng transport 'ws', không dùng 'wss' (theo tài liệu pusher-js)
    enabledTransports: ['ws'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const match = channel.name.match(/^private-store-(\d+)-orders$/);
        const storeId = match ? Number(match[1]) : NaN;
        if (!storeId || Number.isNaN(storeId)) {
          callback(new Error('Invalid channel'), null);
          return;
        }

        const token = useAuthStore.getState().token;
        if (!token) {
          callback(new Error('Chưa đăng nhập'), null);
          return;
        }

        api
          .post(`/stores/${storeId}/realtime/auth`, {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((res) => {
            const auth = parseAuthResponse(res.data);
            if (!auth) {
              callback(new Error('Phản hồi auth không hợp lệ'), null);
              return;
            }
            callback(null, auth);
          })
          .catch((err) => {
            const message =
              err.response?.data?.error?.message ?? err.message ?? 'Auth failed';
            callback(new Error(message), null);
          });
      },
    }),
  });

  sharedClient.connection.bind('failed', () => {
    resetSharedClient();
  });

  return sharedClient;
}

function bindOrderHandlers(
  channel: Channel,
  onOrderChanged: OrderChangedHandler,
): () => void {
  const handler = (data: OrderRealtimePayload | string) => {
    const payload =
      typeof data === 'string'
        ? (JSON.parse(data) as OrderRealtimePayload)
        : data;
    onOrderChanged(payload);
  };

  channel.bind(REALTIME_EVENTS.ORDER_CHANGED, handler);

  return () => {
    channel.unbind(REALTIME_EVENTS.ORDER_CHANGED, handler);
  };
}

function bindSubscriptionHandlers(
  channel: Channel,
  onPaymentPaid: SubscriptionPaymentPaidHandler,
): () => void {
  const handler = (data: SubscriptionRealtimePayload | string) => {
    const payload =
      typeof data === 'string'
        ? (JSON.parse(data) as SubscriptionRealtimePayload)
        : data;
    onPaymentPaid(payload);
  };

  channel.bind(REALTIME_EVENTS.SUBSCRIPTION_PAYMENT_PAID, handler);

  return () => {
    channel.unbind(REALTIME_EVENTS.SUBSCRIPTION_PAYMENT_PAID, handler);
  };
}

export type StoreOrdersSubscription = {
  channel: Channel;
  unsubscribe: () => void;
};

export function subscribeStoreOrders(
  storeId: number,
  onOrderChanged: OrderChangedHandler,
): StoreOrdersSubscription | null {
  const client = getOrCreateClient();
  if (!client) return null;

  const channelName = storeOrdersChannel(storeId);
  let unbindHandlers: (() => void) | null = null;
  let activeChannel: Channel | null = null;
  let cancelled = false;

  let attached = false;

  const attach = () => {
    if (cancelled || attached) return;
    attached = true;
    activeChannel = client.subscribe(channelName);
    unbindHandlers = bindOrderHandlers(activeChannel, onOrderChanged);
  };

  const onConnected = () => {
    client.connection.unbind('connected', onConnected);
    attach();
  };

  if (client.connection.state === 'connected') {
    attach();
  } else {
    client.connection.bind('connected', onConnected);
    if (client.connection.state === 'disconnected' || client.connection.state === 'failed') {
      client.connect();
    }
  }

  return {
    channel: client.channel(channelName) ?? client.subscribe(channelName),
    unsubscribe: () => {
      cancelled = true;
      client.connection.unbind('connected', onConnected);
      unbindHandlers?.();
      client.unsubscribe(channelName);
    },
  };
}

export function subscribeStoreSubscriptionPayments(
  storeId: number,
  onPaymentPaid: SubscriptionPaymentPaidHandler,
): StoreOrdersSubscription | null {
  const client = getOrCreateClient();
  if (!client) return null;

  const channelName = storeOrdersChannel(storeId);
  let unbindHandlers: (() => void) | null = null;
  let activeChannel: Channel | null = null;
  let cancelled = false;
  let attached = false;

  const attach = () => {
    if (cancelled || attached) return;
    attached = true;
    activeChannel = client.subscribe(channelName);
    unbindHandlers = bindSubscriptionHandlers(activeChannel, onPaymentPaid);
  };

  const onConnected = () => {
    client.connection.unbind('connected', onConnected);
    attach();
  };

  if (client.connection.state === 'connected') {
    attach();
  } else {
    client.connection.bind('connected', onConnected);
    if (client.connection.state === 'disconnected' || client.connection.state === 'failed') {
      client.connect();
    }
  }

  return {
    channel: client.channel(channelName) ?? client.subscribe(channelName),
    unsubscribe: () => {
      cancelled = true;
      client.connection.unbind('connected', onConnected);
      unbindHandlers?.();
      client.unsubscribe(channelName);
    },
  };
}

export function disconnectPusher(): void {
  resetSharedClient();
}
