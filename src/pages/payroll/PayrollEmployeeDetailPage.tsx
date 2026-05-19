import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HandCoins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { PAYROLL_DAY_STATUS_LABELS, SALARY_TYPE_LABELS } from '@/constants/payroll';
import { formatMoney } from '@/utils/formatMoney';
import {
  buildHourlyFormulaLines,
  buildMonthlyFormulaLines,
  formatDateShort,
  formatEffectiveWorkDays,
  formatMonthYear,
  formatWorkMinutes,
} from '@/utils/payrollDetail';
import { payrollService } from '@/services/payroll.service';
import { useStoreStore } from '@/stores/store.store';
import { cn } from '@/lib/cn';

type LocationState = {
  month?: number;
  year?: number;
};

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4 border-b border-(--color-border-main) last:border-b-0">
      <span className="flex-none">{label}</span>
      <span
        className={cn(
          'text-sm text-right tabular-nums',
          strong ? 'font-semibold text-(--color-text-main)' : 'text-(--color-text-main)',
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
  const monthFromQuery = Number(searchParams.get('month'));
  const yearFromQuery = Number(searchParams.get('year'));
  const month =
    state.month ??
    (monthFromQuery >= 1 && monthFromQuery <= 12 ? monthFromQuery : now.getMonth() + 1);
  const year =
    state.year ??
    (yearFromQuery >= 2000 && yearFromQuery <= 2100 ? yearFromQuery : now.getFullYear());
  const empId = Number(employeeId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payroll-detail', storeId, empId, month, year],
    queryFn: async () => {
      const res = await payrollService.employeeDetail(storeId!, empId, month, year);
      return res.data.data;
    },
    enabled: !!storeId && Number.isFinite(empId) && empId > 0,
  });

  React.useEffect(() => {
    if (!Number.isFinite(empId) || empId <= 0) {
      navigate(paths.payroll.index, { replace: true });
    }
  }, [empId, navigate]);

  const formulaLines = !data
    ? []
    : data.employee.salaryType === 'MONTHLY'
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

  const workingDayRows = data?.dayBreakdown.filter((d) => d.status !== 'OFF') ?? [];

  return (
    <div className="flex-1 flex flex-col relative h-full min-h-0">
      {isLoading && <LoadingOverlay />}
      <Header
        title={data?.employee.user.name ?? 'Chi tiết lương'}
        subtitle={formatMonthYear(month, year)}
        Icon={HandCoins}
        backUrl={paths.payroll.index}
      />

      <div className="flex-1 overflow-auto pb-6">
        {!isLoading && !data && (
          <p className="px-4 py-8 text-sm text-center text-(--color-text-secondary)">
            {isError ? 'Không tải được dữ liệu lương.' : 'Không có dữ liệu.'}
          </p>
        )}
        {data && (
          <>
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-5 text-center">
              <p className="text-xs text-(--color-text-secondary)">Thực nhận</p>
              <p className="text-2xl font-semibold text-(--color-primary) tabular-nums mt-1">
                {formatMoney(data.salary)}
              </p>
              <p className="text-xs text-(--color-text-secondary) mt-2">
                {SALARY_TYPE_LABELS[data.employee.salaryType]}
              </p>
            </div>

            {data.locked && data.snapshot && (
              <p className="px-4 py-2 text-xs text-(--color-warning) bg-(--color-bg-surface) border-b border-(--color-border-main)">
                Kỳ đã chốt: {formatMoney(data.snapshot.salary)} (ngày{' '}
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
                  className={cn(
                    'px-4 py-3 flex items-center justify-between gap-4 border-b border-(--color-border-main) last:border-b-0',
                  )}
                >
                  <span className="text-sm">{line.label}</span>
                  <span
                    className={cn(
                      'text-sm text-right tabular-nums',
                      line.highlight ? 'font-semibold text-(--color-primary)' : 'text-(--color-text-main)',
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
              <SummaryRow
                label="Ngày công chuẩn"
                value={`${data.counts.standardDays} ngày`}
                strong
              />
              <SummaryRow
                label="Ngày được trả lương"
                value={`${data.counts.paidDays} ngày`}
                strong
              />
              <SummaryRow label="— Đi làm (WORK)" value={`${data.counts.workDays} ngày`} />
              <SummaryRow
                label="— Nghỉ có lương"
                value={`${data.counts.paidLeaveDays} ngày`}
              />
              <SummaryRow
                label="Nghỉ không lương"
                value={`${data.counts.unpaidLeaveDays} ngày`}
              />
              <SummaryRow label="Vắng (không trả)" value={`${data.counts.absentDays} ngày`} />
              <SummaryRow label="Ngày nghỉ theo lịch" value={`${data.counts.offDays} ngày`} />
              {data.employee.salaryType === 'HOURLY' && (
                <SummaryRow
                  label="Tổng giờ làm"
                  value={formatWorkMinutes(data.counts.totalWorkMinutes)}
                  strong
                />
              )}
              <SummaryRow
                label="Lịch làm"
                value={
                  data.employee.usesStoreSchedule
                    ? 'Theo cửa hàng'
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
                workingDayRows.map((day) => (
                  <div key={day.date} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-(--color-text-main)">{formatDateShort(day.date)}</p>
                      <p className="text-xs text-(--color-text-secondary)">
                        {PAYROLL_DAY_STATUS_LABELS[day.status]}
                        {day.countsTowardPaid ? ' · Tính lương' : ''}
                      </p>
                    </div>
                    <span className="text-xs text-(--color-text-secondary) tabular-nums flex-none">
                      {day.status === 'WORK' ? formatWorkMinutes(day.workMinutes) : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
