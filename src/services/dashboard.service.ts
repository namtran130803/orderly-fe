import { api } from '@/lib/api';
import type {
  DashboardFinance,
  DashboardOperations,
  DashboardOrders,
  DashboardStaff,
  DashboardStats,
} from '@/types/dashboard';

export type {
  DashboardStats,
  DashboardFinance,
  DashboardOrders,
  DashboardOperations,
  DashboardStaff,
} from '@/types/dashboard';

export const dashboardService = {
  getStats: (storeId: number, from: string, to: string) =>
    api.get<{ success: true; data: DashboardStats; message: string }>(
      `/stores/${storeId}/dashboard`,
      { params: { from, to } },
    ),

  getFinance: (storeId: number, from: string, to: string) =>
    api.get<{ success: true; data: DashboardFinance; message: string }>(
      `/stores/${storeId}/dashboard/finance`,
      { params: { from, to } },
    ),

  getOrders: (storeId: number, from: string, to: string) =>
    api.get<{ success: true; data: DashboardOrders; message: string }>(
      `/stores/${storeId}/dashboard/orders`,
      { params: { from, to } },
    ),

  getOperations: (storeId: number) =>
    api.get<{ success: true; data: DashboardOperations; message: string }>(
      `/stores/${storeId}/dashboard/operations`,
    ),

  getStaff: (storeId: number, from: string, to: string) =>
    api.get<{ success: true; data: DashboardStaff; message: string }>(
      `/stores/${storeId}/dashboard/staff`,
      { params: { from, to } },
    ),
};
