import { api } from '@/lib/api';

export type MenuItem = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  isAvailable: boolean;
  category?: { id: number; name: string };
};

export const menuItemService = {
  list: (storeId: number) =>
    api.get<{ success: true; data: MenuItem[]; message: string }>(`/stores/${storeId}/menu-items`),

  create: (storeId: number, data: { name: string; price: number; categoryId: number }) =>
    api.post<{ success: true; data: MenuItem; message: string }>(`/stores/${storeId}/menu-items`, data),

  update: (storeId: number, itemId: number, data: { name?: string; price?: number; categoryId?: number }) =>
    api.put<{ success: true; data: MenuItem; message: string }>(`/stores/${storeId}/menu-items/${itemId}`, data),

  remove: (storeId: number, itemId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/menu-items/${itemId}`),
};
