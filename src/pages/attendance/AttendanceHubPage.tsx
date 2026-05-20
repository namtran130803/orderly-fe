import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck2, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { attendanceService } from "@/services/attendance.service";
import { useStoreStore } from "@/stores/store.store";

export const AttendanceHubPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [year, month] = useMemo(() => {
    const [y, m] = ym.split("-").map(Number);
    return [y, m];
  }, [ym]);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-list", storeId, month, year],
    queryFn: async () => {
      const res = await attendanceService.list(storeId!, { month, year });
      return res.data.data;
    },
    enabled: !!storeId,
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header
        title="Danh sách chấm công"
        Icon={CalendarCheck2}
        backUrl={paths.settings.index}
      />

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

            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
              Nhân viên
            </h3>

            {!isLoading && data?.employees?.length === 0 && (
              <div className="text-center py-8 text-(--color-text-muted) text-sm">
                Không có nhân viên
              </div>
            )}

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {data?.employees?.map((emp: any) => (
                <Link
                  key={emp.employeeId}
                  to={`${paths.attendance.employee(emp.employeeId)}?month=${month}&year=${year}`}
                  className="px-4 py-3 flex items-center justify-between gap-2"
                >
                  <span className="font-semibold text-sm text-(--color-text-main) truncate">
                    {emp.user.name}
                  </span>
                  <ChevronRight
                    size={20}
                    className="text-(--color-text-placeholder) shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
