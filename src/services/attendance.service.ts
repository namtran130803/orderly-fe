import { api } from '@/lib/api';

export const attendanceService = {
  list: (storeId: number, params: { month: number; year: number }) =>
    api.get(`/stores/${storeId}/attendance`, { params }),

  employeeDetail: (
    storeId: number,
    employeeId: number,
    month: number,
    year: number,
  ) =>
    api.get(`/stores/${storeId}/attendance/employees/${employeeId}`, {
      params: { month, year },
    }),

  me: (storeId: number, month: number, year: number) =>
    api.get(`/stores/${storeId}/attendance/me`, { params: { month, year } }),

  qrToken: (storeId: number) =>
    api.get<{
      success: boolean;
      data: { token: string; expiresInSec: number };
    }>(`/stores/${storeId}/attendance/qr-token`),

  scan: (storeId: number, qrToken: string) =>
    api.post(`/stores/${storeId}/attendance/scan`, { qrToken }),

  create: (storeId: number, data: unknown) =>
    api.post(`/stores/${storeId}/attendance`, data),

  patch: (storeId: number, attendanceId: number, data: unknown) =>
    api.patch(`/stores/${storeId}/attendance/${attendanceId}`, data),
};
