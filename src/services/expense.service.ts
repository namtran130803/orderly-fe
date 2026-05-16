import { api } from '@/lib/api';

export type Expense = {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  amount: number;
  rawDate: string;
  createdAt: string;
};

export const expenseService = {
  list: (storeId: number, params?: { cursor?: number; from?: string; to?: string; limit?: number }) =>
    api.get<{ success: true; data: { items: Expense[]; nextCursor: number | null }; message: string }>(
      `/stores/${storeId}/expenses`, { params }
    ),

  create: (storeId: number, data: { title: string; amount: number; rawDate?: string }) =>
    api.post<{ success: true; data: Expense; message: string }>(`/stores/${storeId}/expenses`, data),

  update: (storeId: number, expenseId: number, data: { title?: string; amount?: number; rawDate?: string }) =>
    api.put<{ success: true; data: Expense; message: string }>(`/stores/${storeId}/expenses/${expenseId}`, data),

  remove: (storeId: number, expenseId: number) =>
    api.delete<{ success: true; data: null; message: string }>(`/stores/${storeId}/expenses/${expenseId}`),
};
