import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth.store';
import { useStoreStore } from '@/stores/store.store';

export const clearAllStores = () => {
  useAuthStore.getState().logout();
  useStoreStore.getState().clearStore();
  queryClient.clear();
};
