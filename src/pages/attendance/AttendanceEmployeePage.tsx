import React, { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CalendarCheck2, Pencil, CirclePlus, Scan } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { attendanceService } from "@/services/attendance.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";
import { cn } from "@/lib/cn";
import { formatMonthYear } from "@/utils/payrollDetail";
import { parseAttendanceDay, runtimeColorClass } from "@/utils/attendance";

const RUN_LABEL: Record<string, string> = {
  OFF: "Cửa hàng nghỉ",
  ABSENT: "Vắng",
  WORK: "Đi làm",
  PAID_LEAVE: "Nghỉ có lương",
  UNPAID_LEAVE: "Nghỉ không lương",
};

export const AttendanceEmployeePage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const { employeeId: employeeIdParam } = useParams();
  const [search] = useSearchParams();

  const now = new Date();
  const monthFromQ = Number(search.get("month"));
  const yearFromQ = Number(search.get("year"));

  const isMe = employeeIdParam == null;

  const [ym, setYm] = useState(() => {
    if (monthFromQ >= 1 && monthFromQ <= 12 && yearFromQ >= 2000) {
      return `${yearFromQ}-${String(monthFromQ).padStart(2, "0")}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [year, month] = ym.split("-").map(Number);

  const eid = isMe ? undefined : Number(employeeIdParam);

  const canEdit = usePerm(PERMS.attendance.edit);
  const canCreate = usePerm(PERMS.attendance.create);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-employee", storeId, month, year, isMe ? "me" : eid],
    queryFn: async () => {
      if (isMe) {
        const res = await attendanceService.me(storeId!, month, year);
        return res.data.data;
      }
      const res = await attendanceService.employeeDetail(
        storeId!,
        eid!,
        month,
        year,
      );
      return res.data.data;
    },
    enabled:
      !!storeId &&
      !!month &&
      !!year &&
      (isMe || (eid != null && !Number.isNaN(eid))),
  });

  const emp = data?.employees?.[0];

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header
        title={emp?.user?.name ?? "Chấm công"}
        subtitle={formatMonthYear(month, year)}
        Icon={CalendarCheck2}
        backUrl={isMe ? paths.settings.index : paths.attendance.index}
      >
        <Link to={paths.attendance.scan} className="text-(--color-primary)">
          <Scan size={24} />
        </Link>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto py-4 flex flex-col gap-4">
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
            {!isLoading && emp && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {emp.cells.map((cell: any) => {
                  const { weekday, day } = parseAttendanceDay(cell.date);
                  const color = runtimeColorClass(cell.runtime);

                  return (
                    <div
                      key={cell.date}
                      className="px-4 py-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <div className={cn("w-10 shrink-0 text-center", color)}>
                          <div className="text-xs font-semibold leading-tight">
                            {weekday}
                          </div>
                          <div className="text-xl font-bold tabular-nums leading-none mt-1">
                            {day}
                          </div>
                        </div>
                        <p className={cn("text-sm font-medium", color)}>
                          {RUN_LABEL[cell.runtime] ?? cell.runtime}
                        </p>
                      </div>
                      {cell.record && canEdit ? (
                        <Link
                          to={paths.attendance.editRecord(cell.record.id)}
                          state={{ cell, month, year }}
                          className="text-(--color-warning)"
                        >
                          <Pencil size={20} />
                        </Link>
                      ) : cell.record ? null : cell.runtime === "ABSENT" &&
                        canCreate ? (
                        <Link
                          to={paths.attendance.createRecord}
                          state={{
                            employeeId: emp.employeeId,
                            date: cell.date,
                            month,
                            year,
                          }}
                          className="text-(--color-primary)"
                        >
                          <CirclePlus size={20} />
                        </Link>
                      ) : null}
                    </div>
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
