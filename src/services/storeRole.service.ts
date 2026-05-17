import { api } from '@/lib/api';
import type { StoreRole, StoreRoleDto } from '@/schemas/storeRole.schema';

export interface StoreModule {
  code: string;
  name: string;
  apis: {
    code: string;
    name: string;
  }[];
}

export const storeRoleService = {
  getAll: (storeId: number) =>
    api.get<{ success: boolean; data: StoreRole[]; message: string }>(`/stores/${storeId}/roles`),

  create: (storeId: number, data: StoreRoleDto) =>
    api.post<{ success: boolean; data: StoreRole; message: string }>(`/stores/${storeId}/roles`, data),

  update: (storeId: number, roleId: number, data: StoreRoleDto) =>
    api.put<{ success: boolean; data: StoreRole; message: string }>(`/stores/${storeId}/roles/${roleId}`, data),

  delete: (storeId: number, roleId: number) =>
    api.delete<void>(`/stores/${storeId}/roles/${roleId}`),

  getModules: (storeId: number) =>
    api.get<{ success: boolean; data: StoreModule[]; message: string }>(`/stores/${storeId}/modules`),
};
