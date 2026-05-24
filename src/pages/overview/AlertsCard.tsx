import {
  AlarmClockOff,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  PackageX,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";
import { paths } from "@/config/paths";
import type { DashboardOperations } from "@/types/dashboard";

import { overviewListGroupClass } from "./OverviewBand";

type Props = {
  ops: DashboardOperations | null | undefined;
};

export function AlertsCard({ ops }: Props) {
  if (!ops) return null;

  const alerts: {
    key: string;
    title: string;
    detail: string;
    to?: string;
    icon: LucideIcon;
    iconClassName: string;
  }[] = [];

  if (!ops.storeOpenToday) {
    alerts.push({
      key: "closed",
      title: "Nghỉ theo lịch hôm nay",
      detail: "Kiểm tra lịch mặc định và ngày đặc biệt trong tháng.",
      to: paths.schedule.index,
      icon: AlarmClockOff,
      iconClassName: "text-(--color-warning)",
    });
  }

  if (ops.leavePendingCount > 0) {
    alerts.push({
      key: "leave",
      title: `${ops.leavePendingCount} đơn nghỉ chờ duyệt`,
      detail: "Xem và xử lý yêu cầu nghỉ phép.",
      to: paths.leave.index,
      icon: ClipboardList,
      iconClassName: "text-(--color-primary)",
    });
  }

  if (ops.openOrderCount > 0) {
    alerts.push({
      key: "open",
      title: `${ops.openOrderCount} đơn đang xử lý`,
      detail: "Theo dõi bếp / phục vụ.",
      to: paths.orders.index,
      icon: Utensils,
      iconClassName: "text-(--color-warning)",
    });
  }

  if (ops.unavailableMenuCount > 0) {
    alerts.push({
      key: "menu",
      title: `${ops.unavailableMenuCount} món ẩn / hết`,
      detail: "Cập nhật thực đơn khi sẵn sàng phục vụ lại.",
      to: paths.menu.index,
      icon: PackageX,
      iconClassName: "text-(--color-danger)",
    });
  }

  const tableRatio =
    ops.totalTables > 0 ? Math.round((ops.busyTables / ops.totalTables) * 100) : 0;
  const tablesBusyHeavy = ops.totalTables >= 4 && ops.busyTables >= 2;

  if (tablesBusyHeavy) {
    alerts.push({
      key: "tables",
      title: `Tải bàn ${ops.busyTables}/${ops.totalTables}`,
      detail: `${tableRatio}% bàn có đơn.`,
      to: paths.areas.index,
      icon: LayoutGrid,
      iconClassName: "text-(--color-info)",
    });
  }

  if (!alerts.length) return null;

  return (
    <div className={cn("mt-4", overviewListGroupClass)}>
      {alerts.map((a) => {
        const Icon = a.icon;
        const body = (
          <>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Icon size={20} className={cn("shrink-0", a.iconClassName)} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-(--color-text-main)">
                  {a.title}
                </div>
                <p className="text-xs text-(--color-text-secondary) mt-0.5 leading-snug">
                  {a.detail}
                </p>
              </div>
            </div>
            {a.to ? (
              <ChevronRight
                size={20}
                className="text-(--color-text-placeholder) shrink-0"
                aria-hidden
              />
            ) : null}
          </>
        );

        if (a.to) {
          return (
            <Link
              key={a.key}
              to={a.to}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 active:opacity-70"
            >
              {body}
            </Link>
          );
        }

        return (
          <div key={a.key} className="px-4 py-3 flex items-center justify-between gap-3">
            {body}
          </div>
        );
      })}
    </div>
  );
}
