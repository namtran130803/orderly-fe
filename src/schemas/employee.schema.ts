import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createEmployeeSchema = z.object({
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8}$/, 'Số điện thoại không hợp lệ'),
  roleIds: z.array(z.number().int().positive()).min(1, 'Phải chọn ít nhất một vai trò'),
  salaryType: z.enum(['MONTHLY', 'HOURLY']),
  baseSalary: z.number().int().min(0),
  hourlyRate: z.number().int().min(0).optional().nullable(),
  // null/[] = theo lịch cửa hàng; mảng 1–7 = lịch riêng (1=T2…7=CN)
  workDays: z.array(z.number().int().min(1).max(7)).optional().nullable(),
});

export const createEmployeeResolver = zodResolver(createEmployeeSchema);
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

export const assignRolesSchema = z.object({
  roleIds: z.array(z.number().int().positive()).min(1, 'Phải chọn ít nhất một vai trò'),
});

export const assignRolesResolver = zodResolver(assignRolesSchema);
export type AssignRolesDto = z.infer<typeof assignRolesSchema>;

export const updateSalarySchema = z.object({
  salaryType: z.enum(['MONTHLY', 'HOURLY']),
  baseSalary: z.number().int().min(0),
  hourlyRate: z.number().int().min(0).optional().nullable(),
  workDays: z.array(z.number().int().min(1).max(7)).optional().nullable(),
});

export const updateSalaryResolver = zodResolver(updateSalarySchema);
export type UpdateSalaryDto = z.infer<typeof updateSalarySchema>;

export interface EmployeeRole {
  storeRole: {
    id: number;
    name: string;
    permissions: {
      permission: {
        code: string;
        name: string;
      };
    }[];
  };
}

export interface Employee {
  id: number;
  userId: number;
  storeId: number;
  salaryType: 'MONTHLY' | 'HOURLY';
  baseSalary: number;
  hourlyRate: number | null;
  workDays: number[];
  createdAt: string;
  user: {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
  };
  roles: {
    storeRole: {
      id: number;
      name: string;
    };
  }[];
}
