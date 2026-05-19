import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { employeeService } from '@/services/employee.service';
import { useStoreStore } from '@/stores/store.store';
import { digitsFromMoneyInput, formatMoneyInputDisplay } from '@/utils/moneyInput';
import { cn } from '@/lib/cn';
import type { Employee, UpdateSalaryDto } from '@/schemas/employee.schema';

const DAY_LABELS: { value: number; label: string }[] = [
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
  { value: 7, label: 'CN' },
];

export const EmployeeSalaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const employee: Employee | undefined = location.state?.employee;

  const [salaryType, setSalaryType] = useState<'MONTHLY' | 'HOURLY'>(
    employee?.salaryType ?? 'MONTHLY',
  );
  const [amountDigits, setAmountDigits] = useState(
    String(
      salaryType === 'HOURLY'
        ? (employee?.hourlyRate ?? 0)
        : (employee?.baseSalary ?? 0),
    ),
  );
  const [useStoreDays, setUseStoreDays] = useState<boolean>(
    !employee?.workDays || employee.workDays.length === 0,
  );
  const [workDays, setWorkDays] = useState<number[]>(employee?.workDays ?? []);

  React.useEffect(() => {
    if (!employee) navigate(paths.employees.index, { replace: true });
  }, [employee, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: UpdateSalaryDto) =>
      employeeService.updateSalary(storeId!, employee!.id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', storeId] });
      navigateBackOrTo(navigate, paths.employees.index);
    },
  });

  const handleSalaryTypeChange = (type: 'MONTHLY' | 'HOURLY') => {
    setSalaryType(type);
    const prev =
      type === 'HOURLY'
        ? String(employee?.hourlyRate ?? 0)
        : String(employee?.baseSalary ?? 0);
    setAmountDigits(prev === '0' ? '' : prev);
  };

  const toggleDay = (val: number) => {
    setWorkDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val].sort((a, b) => a - b),
    );
  };

  const handleSubmit = () => {
    const amount = Number(amountDigits || '0');
    const dto: UpdateSalaryDto = {
      salaryType,
      baseSalary: salaryType === 'MONTHLY' ? amount : 0,
      hourlyRate: salaryType === 'HOURLY' ? amount : null,
      workDays: useStoreDays ? [] : workDays,
    };
    mutate(dto);
  };

  if (!employee) return null;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header title="Cài đặt lương" Icon={Wallet} backUrl={paths.employees.index}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
          aria-label="Lưu"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <div className="flex-1 overflow-auto pb-6">
        {/* Employee info */}
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
          <p className="font-semibold text-sm text-(--color-text-main)">{employee.user.name}</p>
          <p className="text-xs text-(--color-text-secondary) font-mono">{employee.user.phone}</p>
        </div>

        {/* Warning */}
        <div className="mt-4 mx-4 flex items-start gap-2 text-xs text-(--color-text-secondary)">
          <AlertTriangle size={14} className="mt-0.5 flex-none text-(--color-warning)" />
          <span>Thay đổi này không ảnh hưởng bảng lương đã chốt.</span>
        </div>

        {/* Salary type */}
        <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">Loại lương</h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          {(['MONTHLY', 'HOURLY'] as const).map((type) => (
            <label
              key={type}
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
            >
              <span className="text-sm text-(--color-text-main)">
                {type === 'MONTHLY' ? 'Lương tháng' : 'Lương giờ'}
              </span>
              <input
                type="radio"
                name="salaryType"
                checked={salaryType === type}
                onChange={() => handleSalaryTypeChange(type)}
                className="text-(--color-primary) size-4"
              />
            </label>
          ))}
        </div>

        {/* Amount */}
        <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
          {salaryType === 'MONTHLY' ? 'Lương tháng' : 'Lương mỗi giờ'}
        </h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
          <span className="text-sm text-(--color-text-secondary) flex-none">₫</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatMoneyInputDisplay(amountDigits)}
            onChange={(e) => setAmountDigits(digitsFromMoneyInput(e.target.value))}
            placeholder="0"
            className="flex-1 text-right text-sm"
          />
        </div>
        <p className="px-4 pt-1 text-xs text-(--color-text-secondary)">
          {salaryType === 'MONTHLY' ? 'Lương đủ công trong 1 tháng' : 'Tiền nhận cho mỗi giờ làm việc'}
        </p>

        {/* Schedule */}
        <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">Lịch làm việc</h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
            <span className="text-sm text-(--color-text-main)">Dùng lịch cửa hàng</span>
            <input
              type="radio"
              name="schedule"
              checked={useStoreDays}
              onChange={() => setUseStoreDays(true)}
              className="text-(--color-primary) size-4"
            />
          </label>
          <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
            <span className="text-sm text-(--color-text-main)">Lịch riêng</span>
            <input
              type="radio"
              name="schedule"
              checked={!useStoreDays}
              onChange={() => setUseStoreDays(false)}
              className="text-(--color-primary) size-4"
            />
          </label>
        </div>

        {!useStoreDays && (
          <>
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">Ngày làm</h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex flex-wrap gap-2">
              {DAY_LABELS.map(({ value, label }) => {
                const checked = workDays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold border transition-colors',
                      checked
                        ? 'bg-(--color-primary) text-white border-(--color-primary)'
                        : 'bg-(--color-bg-main) text-(--color-text-secondary) border-(--color-border-main)',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
