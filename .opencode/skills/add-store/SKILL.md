---
name: add-store
description: Use when creating or editing Zustand state stores under src/stores/. Includes both plain stores and persisted stores with the persist middleware.
---

# Zustand Store Pattern

Location: `src/stores/<name>.store.ts`

## Plain store (no persistence)

```typescript
import { create } from 'zustand';

type XState = {
  items: XItem[];
  selectedId: number | null;

  setItems: (items: XItem[]) => void;
  addItem: (item: XItem) => void;
  clear: () => void;
};

export const useXStore = create<XState>()((set) => ({
  items: [],
  selectedId: null,

  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clear: () => set({ items: [], selectedId: null }),
}));
```

## Persisted store (survives refresh)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth' },
  ),
);
```

## Clear all stores helper

`src/stores/clearAllStores.ts` resets all stores + clears React Query cache (called on 401):

```typescript
import { useAuthStore } from './auth.store';
import { useStoreStore } from './store.store';
import { queryClient } from '@/lib/queryClient';

export const clearAllStores = () => {
  useAuthStore.getState().logout();
  useStoreStore.getState().clearStore();
  queryClient.clear();
};
```