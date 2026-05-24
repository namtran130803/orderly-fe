/** Legacy GET /stores/:storeId/dashboard */
export type DashboardStats = {
  revenue: number;
  expense: number;
  orderCount: number;
  topItems: { name: string; qty: number }[];
};

export type DashboardFinanceCompare = {
  revenue: number;
  expense: number;
  profit: number;
  revenuePct: number | null;
  expensePct: number | null;
  profitPct: number | null;
};

export type DashboardFinance = {
  revenue: number;
  expense: number;
  profit: number;
  comparePrevious: DashboardFinanceCompare | null;
};

export type DashboardOrderStatusCount = {
  statusId: number | null;
  name: string;
  count: number;
};

export type DashboardTopItem = {
  name: string;
  qty: number;
  revenue: number;
};

export type DashboardOrdersByHour = {
  hour: number;
  count: number;
};

export type DashboardOrdersCompare = {
  orderCount: number;
  completedOrderCount: number;
  orderCountPct: number | null;
  completedOrderCountPct: number | null;
};

export type DashboardOrders = {
  orderCount: number;
  completedOrderCount: number;
  avgOrderValue: number;
  dineInCount: number;
  takeawayCount: number;
  byStatus: DashboardOrderStatusCount[];
  topItems: DashboardTopItem[];
  ordersByHour: DashboardOrdersByHour[];
  comparePrevious: DashboardOrdersCompare | null;
};

export type DashboardOperations = {
  date: string;
  storeOpenToday: boolean;
  openOrderCount: number;
  busyTables: number;
  totalTables: number;
  unavailableMenuCount: number;
  leavePendingCount: number;
};

export type DashboardStaffOnShift = {
  employeeId: number;
  name: string;
};

export type DashboardStaffToday = {
  scheduledCount: number;
  workingCount: number;
  onShiftNow: DashboardStaffOnShift[];
  absentCount: number;
  paidLeaveToday: number;
  unpaidLeaveToday: number;
};

export type DashboardStaffPeriod = {
  workDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalWorkMinutes: number;
  estimatedPayrollTotal?: number;
  payrollLocked?: boolean;
};

export type DashboardStaff = {
  today: DashboardStaffToday;
  period: DashboardStaffPeriod;
};
