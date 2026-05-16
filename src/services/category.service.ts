import { api } from '@/lib/api';

export type Category = {
  id: number;
  storeId: number;
  name: string;
  sortOrder: number;
};

export const categoryService = {
  list: (storeId: number) =>
    api.get<{ success: true; data: Category[]; message: string }>(`/stores/${storeId}/categories`),

  create: (storeId: number, data: { name: string }) =>
    api.post<{ success: true; data: Category; message: string }>(`/stores/${storeId}/categories`, data),

  update: (storeId: number, catId: number, data: { name?: string }) =>
    api.put<{ success: true; data: Category; message: string }>(`/stores/${storeId}/categories/${catId}`, data),

  remove: (storeId: number, catId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/categories/${catId}`),

  reorder: (storeId: number, ids: number[]) =>
    api.post<{ success: true; data: null; message: string }>(`/stores/${storeId}/categories/reorder`, { ids }),
};
