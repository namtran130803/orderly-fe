import { SALARY_TYPE_LABELS, WEEKDAY_SHORT_LABELS } from '@/constants/payroll';
import { formatWorkMinutes } from '@/utils/payrollDetail';

export type AttendanceRuntime =
  | 'OFF'
  | 'WORK'
  | 'PAID_LEAVE'
  | 'UNPAID_LEAVE'
  | 'ABSENT';

export interface AttendanceCell {
  date: string;
  runtime: AttendanceRuntime;
  record: { workMinutes: number | null } | null;
}

export interface AttendanceMonthStats {
  work: number;
  absent: number;
  paidLeave: number;
  unpaidLeave: number;
  leave: number;
  totalWorkMinutes: number;
}

export interface AttendanceDayParts {
  weekday: string;
  day: number;
}

/** Thứ + ngày trong tháng (không có tháng/năm). */
export function parseAttendanceDay(dateStr: string): AttendanceDayParts {
  const [y, m, d] = dateStr.split('-').map(Number);
  const jsDay = new Date(y, m - 1, d).getDay();
  const iso = jsDay === 0 ? 7 : jsDay;
  return {
    weekday: WEEKDAY_SHORT_LABELS[iso] ?? '',
    day: d,
  };
}

export function runtimeColorClass(runtime: string): string {
  switch (runtime) {
    case 'WORK':
      return 'text-(--color-success)';
    case 'PAID_LEAVE':
      return 'text-(--color-warning)';
    case 'UNPAID_LEAVE':
      return 'text-(--color-text-secondary)';
    case 'ABSENT':
      return 'text-(--color-danger)';
    default:
      return 'text-(--color-text-muted)';
  }
}

export function summarizeAttendanceCells(
  cells: AttendanceCell[],
): AttendanceMonthStats {
  let work = 0;
  let absent = 0;
  let paidLeave = 0;
  let unpaidLeave = 0;
  let totalWorkMinutes = 0;

  for (const cell of cells) {
    switch (cell.runtime) {
      case 'WORK':
        work++;
        break;
      case 'ABSENT':
        absent++;
        break;
      case 'PAID_LEAVE':
        paidLeave++;
        break;
      case 'UNPAID_LEAVE':
        unpaidLeave++;
        break;
    }
    if (cell.record?.workMinutes) {
      totalWorkMinutes += cell.record.workMinutes;
    }
  }

  return {
    work,
    absent,
    paidLeave,
    unpaidLeave,
    leave: paidLeave + unpaidLeave,
    totalWorkMinutes,
  };
}

export type AttendanceStatSegmentKey = 'work' | 'absent' | 'leave' | 'hours';

export interface AttendanceStatSegment {
  key: AttendanceStatSegmentKey;
  text: string;
  colorClass: string;
}

export function buildAttendanceStatSegments(
  stats: AttendanceMonthStats,
  salaryType: 'MONTHLY' | 'HOURLY',
): AttendanceStatSegment[] {
  const segments: AttendanceStatSegment[] = [
    {
      key: 'work',
      text: `${stats.work} ngày làm`,
      colorClass: 'text-(--color-success)',
    },
  ];

  if (stats.absent > 0) {
    segments.push({
      key: 'absent',
      text: `${stats.absent} vắng`,
      colorClass: 'text-(--color-danger)',
    });
  }

  if (stats.leave > 0) {
    segments.push({
      key: 'leave',
      text: `${stats.leave} nghỉ`,
      colorClass: 'text-(--color-warning)',
    });
  }

  if (salaryType === 'HOURLY' && stats.totalWorkMinutes > 0) {
    segments.push({
      key: 'hours',
      text: formatWorkMinutes(stats.totalWorkMinutes),
      colorClass: 'text-(--color-primary)',
    });
  }

  return segments;
}

export function salaryTypeLabel(salaryType: 'MONTHLY' | 'HOURLY'): string {
  return SALARY_TYPE_LABELS[salaryType];
}
