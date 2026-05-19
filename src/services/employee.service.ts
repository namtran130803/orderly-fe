import { api } from '@/lib/api';
import type { Employee, CreateEmployeeDto, AssignRolesDto, UpdateSalaryDto } from '@/schemas/employee.schema';

export const employeeService = {
  getAll: (storeId: number) =>
    api.get<{ success: boolean; data: Employee[]; message: string }>(`/stores/${storeId}/employees`),

  create: (storeId: number, data: CreateEmployeeDto) =>
    api.post<{ success: boolean; data: Employee; message: string }>(`/stores/${storeId}/employees`, data),

  assignRoles: (storeId: number, employeeId: number, data: AssignRolesDto) =>
    api.post<{ success: boolean; data: Employee; message: string }>(`/stores/${storeId}/employees/${employeeId}/roles`, data),

  getRoles: (storeId: number, employeeId: number) =>
    api.get<{ success: boolean; data: any[]; message: string }>(`/stores/${storeId}/employees/${employeeId}/roles`),

  updateSalary: (storeId: number, employeeId: number, data: UpdateSalaryDto) =>
    api.patch<{ success: boolean; data: Employee; message: string }>(`/stores/${storeId}/employees/${employeeId}/salary`, data),
};
