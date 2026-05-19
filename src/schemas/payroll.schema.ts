export type PayrollDayStatus = 'OFF' | 'WORK' | 'PAID_LEAVE' | 'UNPAID_LEAVE' | 'ABSENT';

export interface PayrollEmployeeDetail {
  month: number;
  year: number;
  locked: boolean;
  salary: number;
  employee: {
    id: number;
    user: { id: number; name: string; phone: string };
    salaryType: 'MONTHLY' | 'HOURLY';
    baseSalary: number;
    hourlyRate: number | null;
    workDays: number[];
    usesStoreSchedule: boolean;
    effectiveWorkDays: number[];
  };
  counts: {
    standardDays: number;
    paidDays: number;
    workDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    absentDays: number;
    offDays: number;
    totalWorkMinutes: number;
    totalWorkHours: number;
  };
  snapshot: {
    salary: number;
    standardDays: number;
    paidDays: number;
    lockedAt: string;
  } | null;
  dayBreakdown: {
    date: string;
    status: PayrollDayStatus;
    workMinutes: number | null;
    countsTowardPaid: boolean;
  }[];
}
