import { WEEKDAY_SHORT_LABELS } from '@/constants/payroll';
import { formatMoney } from '@/utils/formatMoney';

export function formatEffectiveWorkDays(days: number[]): string {
  if (days.length === 0) return '—';
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT_LABELS[d] ?? String(d))
    .join(', ');
}

export function formatMonthYear(month: number, year: number): string {
  return `Tháng ${month}/${year}`;
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
}

export function formatWorkMinutes(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export type FormulaLine = {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
};

/** Dòng công thức lương tháng — hiển thị từng bước nhân/chia. */
export function buildMonthlyFormulaLines(
  baseSalary: number,
  standardDays: number,
  paidDays: number,
  salary: number,
): FormulaLine[] {
  const perDay =
    standardDays > 0 ? Math.round(baseSalary / standardDays) : 0;
  return [
    {
      label: 'Lương cơ bản (đủ công)',
      value: formatMoney(baseSalary),
      labelClass: 'text-(--color-text-main)',
      valueClass: 'font-semibold text-(--color-primary)',
    },
    {
      label: 'Ngày công chuẩn',
      value: `${standardDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-main)',
    },
    {
      label: '≈ Mỗi ngày công',
      value: `${formatMoney(perDay)} / ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-warning)',
    },
    {
      label: 'Ngày được trả lương',
      value: `${paidDays} ngày`,
      labelClass: 'text-(--color-text-main)',
      valueClass: 'font-semibold text-(--color-success)',
    },
    {
      label: 'Công thức',
      value: `${formatMoney(baseSalary)} ÷ ${standardDays} × ${paidDays}`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-main)',
    },
    {
      label: 'Thực nhận',
      value: formatMoney(salary),
      labelClass: 'text-(--color-text-main) font-medium',
      valueClass: 'font-bold text-(--color-success)',
    },
  ];
}

/** Dòng số liệu tháng cho bảng lương. */
export function buildMonthStatsLines(
  counts: {
    standardDays: number;
    paidDays: number;
    workDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    absentDays: number;
    offDays: number;
    totalWorkMinutes: number;
  },
  isHourly: boolean,
): FormulaLine[] {
  const lines: FormulaLine[] = [
    {
      label: 'Ngày công chuẩn',
      value: `${counts.standardDays} ngày`,
      labelClass: 'text-(--color-text-main)',
      valueClass: 'font-semibold text-(--color-text-main)',
    },
    {
      label: 'Ngày được trả lương',
      value: `${counts.paidDays} ngày`,
      labelClass: 'text-(--color-text-main) font-medium',
      valueClass: 'font-semibold text-(--color-success)',
    },
    {
      label: 'Đi làm',
      value: `${counts.workDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-success)',
    },
    {
      label: 'Nghỉ có lương',
      value: `${counts.paidLeaveDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-warning)',
    },
    {
      label: 'Nghỉ không lương',
      value: `${counts.unpaidLeaveDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-secondary)',
    },
    {
      label: 'Vắng (không trả)',
      value: `${counts.absentDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-danger)',
    },
    {
      label: 'Ngày nghỉ theo lịch',
      value: `${counts.offDays} ngày`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-secondary)',
    },
  ];

  if (isHourly) {
    lines.push({
      label: 'Tổng giờ làm',
      value: formatWorkMinutes(counts.totalWorkMinutes),
      labelClass: 'text-(--color-text-main) font-medium',
      valueClass: 'font-semibold text-(--color-primary)',
    });
  }

  return lines;
}

/** Dòng công thức lương giờ. */
export function buildHourlyFormulaLines(
  hourlyRate: number,
  totalWorkMinutes: number,
  totalWorkHours: number,
  salary: number,
): FormulaLine[] {
  return [
    {
      label: 'Lương mỗi giờ',
      value: formatMoney(hourlyRate),
      labelClass: 'text-(--color-text-main)',
      valueClass: 'font-semibold text-(--color-primary)',
    },
    {
      label: 'Tổng phút làm (WORK)',
      value: `${totalWorkMinutes.toLocaleString('vi-VN')} phút`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-main)',
    },
    {
      label: '≈ Tổng giờ',
      value: `${totalWorkHours.toLocaleString('vi-VN')} giờ`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-warning)',
    },
    {
      label: 'Công thức',
      value: `${totalWorkHours.toLocaleString('vi-VN')} × ${formatMoney(hourlyRate)}`,
      labelClass: 'text-(--color-text-secondary)',
      valueClass: 'text-(--color-text-main)',
    },
    {
      label: 'Thực nhận',
      value: formatMoney(salary),
      labelClass: 'text-(--color-text-main) font-medium',
      valueClass: 'font-bold text-(--color-success)',
    },
  ];
}
