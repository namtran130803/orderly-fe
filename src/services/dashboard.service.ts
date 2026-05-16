import { api } from '@/lib/api';

export type DashboardStats = {
  revenue: number;
  expense: number;
  orderCount: number;
  topItems: { name: string; qty: number }[];
};

export const dashboardService = {
  getStats: (storeId: number, from: string, to: string) =>
    api.get<{ success: true; data: DashboardStats; message: string }>(
      `/stores/${storeId}/dashboard`,
      { params: { from, to } },
    ),
};
