import { useStoreStore } from "@/stores/store.store";
import { PERMS } from "@/config/perms";

const READ_ONLY_PERMS = new Set<string>([
  PERMS.stores.role_modules,
  PERMS.store_roles.list,
  PERMS.employees.list,
  PERMS.categories.list,
  PERMS.menu_items.list,
  PERMS.areas.list,
  PERMS.tables.list,
  PERMS.statuses.list,
  PERMS.orders.list,
  PERMS.orders.detail,
  PERMS.expenses.list,
  PERMS.dashboard.stats,
  PERMS.attendance.list,
  PERMS.attendance.detail,
  PERMS.schedule.view,
  PERMS.leave.list,
  PERMS.payroll.preview,
  PERMS.payroll.detail,
  PERMS.subscriptions.current,
  PERMS.subscriptions.payments,
  PERMS.subscriptions.periods,
  PERMS.subscriptions.checkout,
]);

export function usePerm(code: string): boolean {
  const store = useStoreStore((s) => s.store);
  const permissions = useStoreStore((s) => s.permissions);

  if (store?.subscription?.isReadOnly && !READ_ONLY_PERMS.has(code)) {
    return false;
  }
  if (store && (!store.roleName || store.roleName.length === 0)) return true;
  return permissions.includes(code);
}
