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

/** Dòng công thức lương tháng — hiển thị từng bước nhân/chia. */
export function buildMonthlyFormulaLines(
  baseSalary: number,
  standardDays: number,
  paidDays: number,
  salary: number,
): { label: string; value: string; highlight?: boolean }[] {
  const perDay =
    standardDays > 0 ? Math.round(baseSalary / standardDays) : 0;
  return [
    { label: 'Lương cơ bản (đủ công)', value: formatMoney(baseSalary) },
    { label: 'Ngày công chuẩn', value: `${standardDays} ngày` },
    { label: '≈ Mỗi ngày công', value: `${formatMoney(perDay)} / ngày` },
    { label: 'Ngày được trả lương', value: `${paidDays} ngày` },
    {
      label: 'Tính',
      value: `${formatMoney(baseSalary)} ÷ ${standardDays} × ${paidDays}`,
    },
    { label: 'Thực nhận', value: formatMoney(salary), highlight: true },
  ];
}

/** Dòng công thức lương giờ. */
export function buildHourlyFormulaLines(
  hourlyRate: number,
  totalWorkMinutes: number,
  totalWorkHours: number,
  salary: number,
): { label: string; value: string; highlight?: boolean }[] {
  return [
    { label: 'Lương mỗi giờ', value: formatMoney(hourlyRate) },
    { label: 'Tổng phút làm (WORK)', value: `${totalWorkMinutes.toLocaleString('vi-VN')} phút` },
    { label: '≈ Tổng giờ', value: `${totalWorkHours.toLocaleString('vi-VN')} giờ` },
    {
      label: 'Tính',
      value: `${totalWorkHours.toLocaleString('vi-VN')} × ${formatMoney(hourlyRate)}`,
    },
    { label: 'Thực nhận', value: formatMoney(salary), highlight: true },
  ];
}
