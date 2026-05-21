import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { CircleDollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import {
  PAYROLL_DAY_STATUS_LABELS,
  SALARY_TYPE_LABELS,
} from "@/constants/payroll";
import { formatMoney } from "@/utils/formatMoney";
import {
  buildHourlyFormulaLines,
  buildMonthlyFormulaLines,
  buildMonthStatsLines,
  formatDateShort,
  formatEffectiveWorkDays,
  formatMonthYear,
  formatWorkMinutes,
} from "@/utils/payrollDetail";
import { payrollService } from "@/services/payroll.service";
import { useStoreStore } from "@/stores/store.store";
import { cn } from "@/lib/cn";

type LocationState = {
  month?: number;
  year?: number;
};

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4 border-b border-(--color-border-main) last:border-b-0">
      <span className="flex-none">{label}</span>
      <span
        className={cn(
          "text-sm text-right tabular-nums",
          strong
            ? "font-semibold text-(--color-text-main)"
            : "text-(--color-text-main)",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export const PayrollEmployeeDetailPage: React.FC = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const storeId = useStoreStore((s) => s.store?.id);
  const state = (location.state ?? {}) as LocationState;

  const now = new Date();
  const monthFromQuery = Number(searchParams.get("month"));
  const yearFromQuery = Number(searchParams.get("year"));

  const [ym, setYm] = useState(() => {
    if (state.month && state.year) {
      return `${state.year}-${String(state.month).padStart(2, "0")}`;
    }
    if (monthFromQuery >= 1 && monthFromQuery <= 12 && yearFromQuery >= 2000) {
      return `${yearFromQuery}-${String(monthFromQuery).padStart(2, "0")}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [year, month] = ym.split("-").map(Number);

  const isMe = employeeId == null;
  const empId = isMe ? undefined : Number(employeeId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payroll-detail", storeId, isMe ? "me" : empId, month, year],
    queryFn: async () => {
      if (isMe) {
        const res = await payrollService.me(storeId!, month, year);
        return res.data.data;
      }
      const res = await payrollService.employeeDetail(
        storeId!,
        empId!,
        month,
        year,
      );
      return res.data.data;
    },
    enabled:
      !!storeId &&
      !!month &&
      !!year &&
      (isMe || (Number.isFinite(empId) && empId! > 0)),
  });

  React.useEffect(() => {
    if (!isMe && (!Number.isFinite(empId) || empId! <= 0)) {
      navigate(paths.payroll.index, { replace: true });
    }
  }, [isMe, empId, navigate]);

  const formulaLines = !data
    ? []
    : data.employee.salaryType === "MONTHLY"
      ? buildMonthlyFormulaLines(
          data.employee.baseSalary,
          data.counts.standardDays,
          data.counts.paidDays,
          data.salary,
        )
      : buildHourlyFormulaLines(
          data.employee.hourlyRate ?? 0,
          data.counts.totalWorkMinutes,
          data.counts.totalWorkHours,
          data.salary,
        );

  const statsLines = !data
    ? []
    : buildMonthStatsLines(
        {
          standardDays: data.counts.standardDays,
          paidDays: data.counts.paidDays,
          workDays: data.counts.workDays,
          paidLeaveDays: data.counts.paidLeaveDays,
          unpaidLeaveDays: data.counts.unpaidLeaveDays,
          absentDays: data.counts.absentDays,
          offDays: data.counts.offDays,
          totalWorkMinutes: data.counts.totalWorkMinutes,
        },
        data.employee.salaryType === "HOURLY",
      );

  const workingDayRows =
    data?.dayBreakdown.filter((d) => d.status !== "OFF") ?? [];

  return (
    <div className="flex-1 flex flex-col relative h-full min-h-0">
      {isLoading && <LoadingOverlay />}
      <Header
        title={data?.employee.user.name ?? "Bảng lương"}
        subtitle={formatMonthYear(month, year)}
        Icon={CircleDollarSign}
        backUrl={isMe ? paths.settings.index : paths.payroll.index}
      />

      <div className="flex-1 overflow-auto pb-6">
        {!isLoading && !data && (
          <p className="px-4 py-8 text-sm text-center text-(--color-text-secondary)">
            {isError ? "Không tải được dữ liệu lương." : "Không có dữ liệu."}
          </p>
        )}
        {data && (
          <>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4 mt-4">
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

            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-5 text-center">
              <p className="text-xs text-(--color-text-secondary)">Thực nhận</p>
              <p className="text-2xl font-bold text-(--color-success) tabular-nums mt-1">
                {formatMoney(data.salary)}
              </p>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 mt-2 text-[10px] font-semibold border",
                  data.employee.salaryType === "MONTHLY"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200",
                )}
              >
                {SALARY_TYPE_LABELS[data.employee.salaryType]}
              </span>
            </div>

            {data.locked && data.snapshot && (
              <p className="px-4 py-2 text-xs text-(--color-warning) bg-(--color-bg-surface) border-b border-(--color-border-main)">
                Kỳ đã chốt: {formatMoney(data.snapshot.salary)} (ngày{" "}
                {data.snapshot.paidDays}/{data.snapshot.standardDays})
              </p>
            )}

            <h3 className="sticky top-0 z-10 font-semibold text-(--color-text-secondary) px-4 py-3 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
              Cách tính
            </h3>
            <div className="bg-(--color-bg-surface) border-b border-(--color-border-main)">
              {formulaLines.map((line) => (
                <div
                  key={line.label}
                  className="px-4 py-3 flex items-center justify-between gap-4 border-b border-(--color-border-main) last:border-b-0"
                >
                  <span className={cn("text-sm", line.labelClass)}>
                    {line.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-right tabular-nums",
                      line.valueClass,
                    )}
                  >
                    {line.value}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="sticky top-0 z-10 font-semibold text-(--color-text-secondary) px-4 py-3 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
              Số liệu tháng
            </h3>
            <div className="bg-(--color-bg-surface) border-b border-(--color-border-main)">
              {statsLines.map((line) => (
                <div
                  key={line.label}
                  className="px-4 py-3 flex items-center justify-between gap-4 border-b border-(--color-border-main) last:border-b-0"
                >
                  <span className={cn("text-sm", line.labelClass)}>
                    {line.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-right tabular-nums",
                      line.valueClass,
                    )}
                  >
                    {line.value}
                  </span>
                </div>
              ))}
              <SummaryRow
                label="Lịch làm"
                value={
                  data.employee.usesStoreSchedule
                    ? "Theo cửa hàng"
                    : formatEffectiveWorkDays(data.employee.effectiveWorkDays)
                }
              />
            </div>

            <h3 className="sticky top-0 z-10 font-semibold text-(--color-text-secondary) px-4 py-3 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
              Từng ngày làm ({workingDayRows.length})
            </h3>
            <div className="bg-(--color-bg-surface) border-b border-(--color-border-main) divide-y divide-(--color-border-main)">
              {workingDayRows.length === 0 ? (
                <p className="px-4 py-4 text-sm text-(--color-text-secondary) text-center">
                  Không có ngày làm trong tháng.
                </p>
              ) : (
                workingDayRows.map((day) => {
                  const statusConfig = {
                    WORK: {
                      bg: "bg-emerald-50",
                      text: "text-emerald-700",
                      border: "border-emerald-200",
                      dot: "bg-emerald-500",
                    },
                    ABSENT: {
                      bg: "bg-red-50",
                      text: "text-red-700",
                      border: "border-red-200",
                      dot: "bg-red-500",
                    },
                    PAID_LEAVE: {
                      bg: "bg-amber-50",
                      text: "text-amber-700",
                      border: "border-amber-200",
                      dot: "bg-amber-500",
                    },
                    UNPAID_LEAVE: {
                      bg: "bg-gray-100",
                      text: "text-gray-600",
                      border: "border-gray-200",
                      dot: "bg-gray-400",
                    },
                    OFF: {
                      bg: "bg-gray-50",
                      text: "text-gray-400",
                      border: "border-gray-200",
                      dot: "bg-gray-300",
                    },
                  };
                  const cfg = statusConfig[day.status];

                  return (
                    <div
                      key={day.date}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                        <div className="min-w-0">
                          <p className="text-sm text-(--color-text-main)">
                            {formatDateShort(day.date)}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium border",
                              cfg.bg,
                              cfg.text,
                              cfg.border,
                            )}
                          >
                            {PAYROLL_DAY_STATUS_LABELS[day.status]}
                            {day.countsTowardPaid}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs tabular-nums flex-none font-medium",
                          day.status === "WORK"
                            ? "text-(--color-success)"
                            : "text-(--color-text-secondary)",
                        )}
                      >
                        {day.status === "WORK"
                          ? formatWorkMinutes(day.workMinutes)
                          : "—"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
