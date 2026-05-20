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
  QrCode,
  Scan,
  HandCoins,
  Info,
  FileText,
} from "lucide-react";
import { Header } from "@/components/Header";
import { paths } from "@/config/paths";
import { useAuthStore } from "@/stores/auth.store";
import { clearAllStores } from "@/stores/clearAllStores";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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
                <p className="font-medium truncate">
                  {user?.name || "Chưa đăng nhập"}
                </p>
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
            </div>

            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
              Nhân viên & vai trò
            </h3>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <Link
                to={paths.roles.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-(--color-danger)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Vai trò
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>

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
            </div>

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
                    Lịch làm việc
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.attendance.kiosk}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="text-(--color-primary)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    QR chấm công
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.attendance.scan}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Scan className="text-(--color-info)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Quét QR chấm công
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.attendance.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck2
                    className="text-(--color-success)"
                    size={20}
                  />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Danh sách chấm công
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.leave.request}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-(--color-primary)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Viết đơn xin nghỉ
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.leave.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Palmtree className="text-(--color-success)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Danh sách đơn nghỉ
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
              <Link
                to={paths.payroll.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <HandCoins className="text-(--color-warning)" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Bảng lương
                  </span>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder)"
                />
              </Link>
            </div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
              <button
                onClick={() => {
                  clearAllStores();
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
