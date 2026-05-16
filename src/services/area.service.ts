import { api } from '@/lib/api';

export type Table = {
  id: number;
  areaId: number;
  name: string;
  orderId: number | null;
  sortOrder: number;
};

export type Area = {
  id: number;
  storeId: number;
  name: string;
  sortOrder: number;
};

export const areaService = {
  list: (storeId: number) =>
    api.get<{ success: true; data: Area[]; message: string }>(`/stores/${storeId}/areas`),

  create: (storeId: number, data: { name: string; tableCount: number }) =>
    api.post<{ success: true; data: Area; message: string }>(`/stores/${storeId}/areas`, data),

  update: (storeId: number, areaId: number, data: { name?: string; tableCount?: number }) =>
    api.put<{ success: true; data: Area; message: string }>(`/stores/${storeId}/areas/${areaId}`, data),

  remove: (storeId: number, areaId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/areas/${areaId}`),

  reorder: (storeId: number, ids: number[]) =>
    api.patch<{ success: true; data: Area[]; message: string }>(`/stores/${storeId}/areas/reorder`, { ids }),
};

export type TableWithArea = Table & { area: { id: number; name: string } };

export const tableService = {
  list: (storeId: number) =>
    api.get<{ success: true; data: TableWithArea[]; message: string }>(`/stores/${storeId}/tables`),

  update: (storeId: number, tableId: number, data: { name: string }) =>
    api.put<{ success: true; data: Table; message: string }>(`/stores/${storeId}/tables/${tableId}`, data),

  remove: (storeId: number, tableId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/tables/${tableId}`),
};
