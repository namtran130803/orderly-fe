import { api } from '@/lib/api';

export const leaveService = {
  list: (storeId: number, params?: { status?: string }) =>
    api.get(`/stores/${storeId}/leave`, { params }),

  me: (storeId: number, params?: { status?: string }) =>
    api.get(`/stores/${storeId}/leave/me`, { params }),

  create: (
    storeId: number,
    body: { fromDate: string; toDate: string; isPaid: boolean; reason?: string | null },
  ) => api.post(`/stores/${storeId}/leave`, body),

  approve: (storeId: number, leaveId: number) =>
    api.patch(`/stores/${storeId}/leave/${leaveId}/approve`),

  reject: (storeId: number, leaveId: number) =>
    api.patch(`/stores/${storeId}/leave/${leaveId}/reject`),
};
