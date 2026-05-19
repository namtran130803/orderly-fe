import { api } from '@/lib/api';

export const scheduleService = {
  get: (storeId: number) => api.get(`/stores/${storeId}/schedule`),

  putDefault: (storeId: number, defaultWorkDays: number[]) =>
    api.put(`/stores/${storeId}/schedule/default`, { defaultWorkDays }),

  postOverride: (storeId: number, body: { date: string; type: 'OFF' | 'WORKING_DAY' }) =>
    api.post(`/stores/${storeId}/schedule/overrides`, body),

  deleteOverride: (storeId: number, overrideId: number) =>
    api.delete(`/stores/${storeId}/schedule/overrides/${overrideId}`),
};
