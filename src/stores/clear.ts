import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth.store';
import { useStoreStore } from '@/stores/store.store';

export const clearAll = () => {
  useAuthStore.getState().logout();
  useStoreStore.getState().clearStore();
  queryClient.clear();
};

export const clearStore = () => {
  useStoreStore.getState().clearStore();
  queryClient.clear();
};
