import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store } from "@/services/store.service";

export type ApiDef = {
  code: string;
  name: string;
};

export type ModuleDef = {
  code: string;
  name: string;
  apis: ApiDef[];
};

type StoreState = {
  store: Store | null;
  modules: ModuleDef[];
  permissions: string[];
  setStore: (store: Store) => void;
  setModules: (modules: ModuleDef[]) => void;
  setPermissions: (permissions: string[]) => void;
  clearStore: () => void;
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      store: null,
      modules: [],
      permissions: [],
      setStore: (store) => set({ store }),
      setModules: (modules) => set({ modules }),
      setPermissions: (permissions) => set({ permissions }),
      clearStore: () => set({ store: null, modules: [], permissions: [] }),
    }),
    { name: "store" },
  ),
);