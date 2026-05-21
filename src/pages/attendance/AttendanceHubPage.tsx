import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck2, ChevronRight, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { attendanceService } from "@/services/attendance.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";
import { useAuthStore } from "@/stores/auth.store";
import { formatEffectiveWorkDays } from "@/utils/payrollDetail";
import {
  buildAttendanceStatSegments,
  salaryTypeLabel,
  summarizeAttendanceCells,
  type AttendanceCell,
} from "@/utils/attendance";
import { todayVnDateString } from "@/lib/date-vn";

export const AttendanceHubPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);

  const canList = usePerm(PERMS.attendance.list);

  const todayStr = todayVnDateString();
  const [todayY, todayM] = todayStr.split('-').map(Number);
  const [ym, setYm] = useState(
    `${todayY}-${String(todayM).padStart(2, "0")}`,
  );
  const [year, month] = ym.split("-").map(Number);

  useEffect(() => {
    if (!canList) {
      navigate(paths.attendance.me, { replace: true });
    }
  }, [canList, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-list", storeId, month, year],
    queryFn: async () => {
      const res = await attendanceService.list(storeId!, { month, year });
      return res.data.data;
    },
    enabled: !!storeId && canList,
  });

  // Lọc bỏ chủ cửa hàng (không có roles hoặc roles rỗng)
  const employees = data?.employees?.filter(
    (emp: any) => emp.user.id !== user.id,
  ) || [];

  const hasEmployees = employees.length > 0;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header
        title="Chấm công"
        Icon={CalendarCheck2}
        backUrl={paths.settings.index}
      >
        <Link to={paths.attendance.kiosk} className="text-(--color-primary)">
          <QrCode size={24} />
        </Link>
      </Header>

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
              <span className="font-medium text-sm text-(--color-text-main) flex-none">
                Tháng
              </span>
              <input
                type="month"
                value={ym}
                onChange={(e) => setYm(e.target.value)}
                className="flex-1 text-right text-sm"
              />
            </div>

            {hasEmployees && (
              <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
                Nhân viên
              </h3>
            )}

            {!isLoading && !hasEmployees && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <CalendarCheck2 size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Chưa có nhân viên</p>
              </div>
            )}

            {hasEmployees && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {employees.map((emp: any) => {
                  const stats = summarizeAttendanceCells(
                    emp.cells as AttendanceCell[],
                  );
                  const workDays =
                    emp.workDays?.length > 0
                      ? emp.workDays
                      : (data?.defaultWorkDays ?? []);
                  const statSegments = buildAttendanceStatSegments(
                    stats,
                    emp.salaryType,
                  );

                  return (
                    <Link
                      key={emp.employeeId}
                      to={`${paths.attendance.employee(emp.employeeId)}?month=${month}&year=${year}`}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-(--color-text-main) truncate">
                            {emp.user.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-(--color-text-secondary) mt-1">
                          Ca {formatEffectiveWorkDays(workDays)} ·{" "}
                          {salaryTypeLabel(emp.salaryType)}
                        </div>
                        <div className="text-[11px] mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 font-medium">
                          {statSegments.map((seg, i) => (
                            <React.Fragment key={seg.key}>
                              {i > 0 && (
                                <span className="text-(--color-text-placeholder)">
                                  ·
                                </span>
                              )}
                              <span className={seg.colorClass}>{seg.text}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-(--color-text-placeholder) flex-none"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
