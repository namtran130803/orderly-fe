import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  Store,
  BookOpen,
  Grid,
  Activity,
  ChevronRight,
  LogOut,
  Users,
  ShieldAlert,
  CalendarCheck2,
  CalendarRange,
  Palmtree,
  CircleDollarSign,
  Info,
  CreditCard,
} from "lucide-react";
import { Header } from "@/components/Header";
import { paths } from "@/config/paths";
import { useAuthStore } from "@/stores/auth.store";
import { clearAll } from "@/stores/clear";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canAttendanceList = usePerm(PERMS.attendance.list);
  const canLeaveList = usePerm(PERMS.leave.list);
  const canPayrollPreview = usePerm(PERMS.payroll.preview);
  const canMenuItemsList = usePerm(PERMS.menu_items.list);
  const canAreasList = usePerm(PERMS.areas.list);
  const canStatusesList = usePerm(PERMS.statuses.list);
  const canStoreRolesList = usePerm(PERMS.store_roles.list);
  const canEmployeesList = usePerm(PERMS.employees.list);
  const canSubscriptionCurrent = usePerm(PERMS.subscriptions.current);
  const canSubscriptionCheckout = usePerm(PERMS.subscriptions.checkout);
  const canSubscriptionPeriods = usePerm(PERMS.subscriptions.periods);
  const canShowSubscription =
    canSubscriptionCurrent && canSubscriptionCheckout && canSubscriptionPeriods;

  const handleAttendanceClick = () => {
    if (canAttendanceList) navigate(paths.attendance.index);
    else navigate(paths.attendance.me);
  };

  const handleLeaveClick = () => {
    if (canLeaveList) navigate(paths.leave.index);
    else navigate(paths.leave.me);
  };

  const handlePayrollClick = () => {
    if (canPayrollPreview) navigate(paths.payroll.index);
    else navigate(paths.payroll.me);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header Icon={Settings} title="Quản lý" />

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) flex items-center gap-4 px-4 py-3 mt-4">
              <div className="size-12 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center font-bold text-xl">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-(--color-text-secondary) truncate">
                  {user?.phone}
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
              Dữ liệu & Vận hành
            </h3>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <Link
                to={paths.stores.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Store className="text-(--color-primary)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Cửa hàng
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>

              {canShowSubscription && (
                <Link
                  to={paths.settings.subscription}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-(--color-warning)" size={20} />
                    <span className="text-sm text-(--color-text-main) font-medium">
                      Gia hạn
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-(--color-text-placeholder)"
                  />
                </Link>
              )}

              {canMenuItemsList && (
                <Link
                  to={paths.menu.index}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-(--color-success)" size={20} />
                    <span className="text-sm text-(--color-text-main) font-medium">
                      Thực đơn
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-(--color-text-placeholder)"
                  />
                </Link>
              )}

              {canAreasList && (
                <Link
                  to={paths.areas.index}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Grid className="text-(--color-warning)" size={20} />
                    <span className="text-sm text-(--color-text-main) font-medium">
                      Bàn ăn
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-(--color-text-placeholder)"
                  />
                </Link>
              )}

              {canStatusesList && (
                <Link
                  to={paths.statuses.index}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="text-(--color-info)" size={20} />
                    <span className="text-sm text-(--color-text-main) font-medium">
                      Quy trình
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-(--color-text-placeholder)"
                  />
                </Link>
              )}
            </div>

            {(canStoreRolesList || canEmployeesList) && (
              <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
                Nhân viên & vai trò
              </h3>
            )}

            {canStoreRolesList && canEmployeesList && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {canStoreRolesList && (
                  <Link
                    to={paths.roles.index}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert
                        className="text-(--color-danger)"
                        size={20}
                      />
                      <span className="text-sm text-(--color-text-main) font-medium">
                        Vai trò
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-(--color-text-placeholder)"
                    />
                  </Link>
                )}

                {canEmployeesList && (
                  <Link
                    to={paths.employees.index}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="text-(--color-info)" size={20} />
                      <span className="text-sm text-(--color-text-main) font-medium">
                        Nhân viên
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-(--color-text-placeholder)"
                    />
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="font-semibold text-(--color-text-secondary)">
                Chấm công & lương
              </h3>
              <Link
                to={paths.settings.hrGuide}
                className="text-(--color-primary) p-1 -mr-1"
                aria-label="Hướng dẫn chấm công và lương"
              >
                <Info size={20} />
              </Link>
            </div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <Link
                to={paths.schedule.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CalendarRange className="text-(--color-info)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Lịch làm
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>

              <button
                type="button"
                onClick={handleAttendanceClick}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck2
                    className="text-(--color-success)"
                    size={20}
                  />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Chấm công
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </button>

              <button
                type="button"
                onClick={handleLeaveClick}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Palmtree className="text-(--color-success)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Xin nghỉ
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </button>

              <button
                type="button"
                onClick={handlePayrollClick}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CircleDollarSign
                    className="text-(--color-warning)"
                    size={20}
                  />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Bảng lương
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </button>
            </div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
              <button
                onClick={() => {
                  clearAll();
                  navigate(paths.auth.login, { replace: true });
                }}
                className="w-full px-4 py-3 flex items-center justify-start gap-3 text-(--color-danger)"
              >
                <LogOut size={20} />
                <span className="text-sm font-semibold">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
