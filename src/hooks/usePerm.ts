import { useStoreStore } from "@/stores/store.store";

export function usePerm(code: string): boolean {
  const store = useStoreStore((s) => s.store);
  const permissions = useStoreStore((s) => s.permissions);

  if (store && (!store.roleName || store.roleName.length === 0)) return true;
  return permissions.includes(code);
}
