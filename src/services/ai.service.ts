import { api } from '@/lib/api';

export const aiService = {
  analyzeMenu: (storeId: number, data: { image: string }) =>
    api.post<{ success: true; data: { description: string }; message: string }>(
      `/stores/${storeId}/ai/menu/analyze`,
      data,
    ),

  generateMenu: (storeId: number, data: { description: string; mode: 'replace' | 'append' }) =>
    api.post<{ success: true; data: { categories: unknown[]; menuItems: unknown[] }; message: string }>(
      `/stores/${storeId}/ai/menu/generate`,
      data,
    ),

  analyzeExpense: (storeId: number, data: { image: string }) =>
    api.post<{ success: true; data: { description: string }; message: string }>(
      `/stores/${storeId}/ai/expenses/analyze`,
      data,
    ),

  generateExpense: (storeId: number, data: { description: string }) =>
    api.post<{ success: true; data: { expenses: unknown[] }; message: string }>(
      `/stores/${storeId}/ai/expenses/generate`,
      data,
    ),
};
