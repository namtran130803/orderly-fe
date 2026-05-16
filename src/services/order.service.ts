import { api } from "@/lib/api";

export type OrderItem = {
  id: number;
  menuItemId: number | null;
  statusId: number | null;
  statusSnapshot: string | null;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
};

export type Order = {
  id: number;
  tableId: number | null;
  tableSnapshot: string | null;
  statusId: number | null;
  statusSnapshot: string | null;
  createdAt: string;
  items: OrderItem[];
};

export const orderService = {
  list: (
    storeId: number,
    params?: {
      statusId?: number;
      date?: string;
      cursor?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    },
  ) =>
    api.get<{ success: true; data: Order[]; nextCursor: number | null }>(
      `/stores/${storeId}/orders`,
      { params },
    ),

  detail: (storeId: number, orderId: number) =>
    api.get<{ success: true; data: Order; message: string }>(
      `/stores/${storeId}/orders/${orderId}`,
    ),

  create: (
    storeId: number,
    data: {
      tableName?: string | null;
      items: { menuItemId: number; qty: number }[];
    },
  ) =>
    api.post<{ success: true; data: Order; message: string }>(
      `/stores/${storeId}/orders`,
      data,
    ),

  update: (
    storeId: number,
    orderId: number,
    data: {
      tableName?: string | null;
      items: { menuItemId: number; qty: number }[];
    },
  ) =>
    api.put<{ success: true; data: Order; message: string }>(
      `/stores/${storeId}/orders/${orderId}`,
      data,
    ),

  remove: (storeId: number, orderId: number) =>
    api.delete<{ success: true; message: string }>(
      `/stores/${storeId}/orders/${orderId}`,
    ),

  advance: (storeId: number, orderId: number, data: { fromStatusId: number }) =>
    api.patch<{ success: true; data: Order; message: string }>(
      `/stores/${storeId}/orders/${orderId}/advance`,
      data,
    ),

  revert: (storeId: number, orderId: number, data: { fromStatusId: number }) =>
    api.patch<{ success: true; data: Order; message: string }>(
      `/stores/${storeId}/orders/${orderId}/revert`,
      data,
    ),
};
