import { api } from '@/lib/api';

export const STATUS_TYPE = {
  START: 'start' as const,
  MID: 'mid' as const,
  END: 'end' as const,
};

export type StatusType = (typeof STATUS_TYPE)[keyof typeof STATUS_TYPE];

export type Status = {
  id: number;
  storeId: number;
  name: string;
  type: StatusType;
  sortOrder: number;
};

export const statusService = {
  list: (storeId: number) =>
    api.get<{ success: true; data: Status[]; message: string }>(`/stores/${storeId}/statuses`),

  create: (storeId: number, data: { name: string }) =>
    api.post<{ success: true; data: Status; message: string }>(`/stores/${storeId}/statuses`, data),

  update: (storeId: number, statusId: number, data: { name: string }) =>
    api.put<{ success: true; data: Status; message: string }>(`/stores/${storeId}/statuses/${statusId}`, data),

  remove: (storeId: number, statusId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/statuses/${statusId}`),

  reorder: (storeId: number, ids: number[]) =>
    api.patch<{ success: true; data: Status[]; message: string }>(`/stores/${storeId}/statuses/reorder`, { ids }),
};
