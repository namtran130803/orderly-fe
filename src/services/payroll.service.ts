import { api } from '@/lib/api';
import type { PayrollEmployeeDetail } from '@/schemas/payroll.schema';

export const payrollService = {
  preview: (storeId: number, month: number, year: number) =>
    api.get(`/stores/${storeId}/payroll`, { params: { month, year } }),

  me: (storeId: number, month: number, year: number) =>
    api.get<{ success: boolean; data: PayrollEmployeeDetail; message: string }>(
      `/stores/${storeId}/payroll/me`,
      { params: { month, year } },
    ),

  employeeDetail: (storeId: number, employeeId: number, month: number, year: number) =>
    api.get<{ success: boolean; data: PayrollEmployeeDetail; message: string }>(
      `/stores/${storeId}/payroll/employees/${employeeId}`,
      { params: { month, year } },
    ),

  lock: (storeId: number, month: number, year: number) =>
    api.post(`/stores/${storeId}/payroll/lock`, {}, { params: { month, year } }),

  unlock: (storeId: number, month: number, year: number) =>
    api.delete(`/stores/${storeId}/payroll/lock`, { params: { month, year } }),
};
