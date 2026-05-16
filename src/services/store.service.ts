import { api } from '@/lib/api';

export type Store = {
  id: number;
  name: string;
  address: string | null;
  userId: number;
  createdAt: string;
};

export const storeService = {
  list: () =>
    api.get<{ success: true; data: Store[]; message: string }>('/stores'),

  create: (data: { name: string; address?: string | null }) =>
    api.post<{ success: true; data: Store; message: string }>('/stores', data),

  update: (storeId: number, data: { name?: string; address?: string | null }) =>
    api.put<{ success: true; data: Store; message: string }>(`/stores/${storeId}`, data),

  remove: (storeId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}`),
};
