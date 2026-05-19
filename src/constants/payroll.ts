/** Nhãn trạng thái ngày trên bảng chi tiết lương. */
export const PAYROLL_DAY_STATUS_LABELS: Record<
  'OFF' | 'WORK' | 'PAID_LEAVE' | 'UNPAID_LEAVE' | 'ABSENT',
  string
> = {
  OFF: 'Nghỉ theo lịch',
  WORK: 'Đi làm',
  PAID_LEAVE: 'Nghỉ có lương',
  UNPAID_LEAVE: 'Nghỉ không lương',
  ABSENT: 'Vắng',
};

/** 1 = T2 … 7 = CN (theo iso weekday VN trong BE). */
export const WEEKDAY_SHORT_LABELS: Record<number, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  7: 'CN',
};

export const SALARY_TYPE_LABELS = {
  MONTHLY: 'Lương tháng',
  HOURLY: 'Lương giờ',
} as const;
