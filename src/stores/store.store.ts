import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '@/services/store.service';

type StoreState = {
  store: Store | null;
  setStore: (store: Store) => void;
  clearStore: () => void;
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      store: null,
      setStore: (store) => set({ store }),
      clearStore: () => set({ store: null }),
    }),
    { name: 'store' },
  ),
);
