import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { navigateBackOrTo } from "@/lib/browser-history";
import { employeeService } from "@/services/employee.service";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreStore } from "@/stores/store.store";
import {
  createEmployeeResolver,
  type CreateEmployeeDto,
  type UpdateSalaryDto,
  type Employee,
} from "@/schemas/employee.schema";
import {
  digitsFromMoneyInput,
  formatMoneyInputDisplay,
} from "@/utils/moneyInput";
import { cn } from "@/lib/cn";

const DAY_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

type Props = {
  type: "create" | "edit";
};

export const EmployeeFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const employee: Employee | undefined = location.state?.employee;

  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  // Edit-mode salary local state
  const [salaryType, setSalaryType] = useState<"MONTHLY" | "HOURLY">("MONTHLY");
  const [amountDigits, setAmountDigits] = useState("");
  const [useStoreDays, setUseStoreDays] = useState(true);
  const [customDays, setCustomDays] = useState<number[]>([]);

  useEffect(() => {
    if (type === "edit" && !employee) {
      navigate(paths.employees.index, { replace: true });
    }
  }, [type, employee, navigate]);

  // Pre-fill salary fields from employee data in edit mode
  useEffect(() => {
    if (type === "edit" && employee) {
      const st = employee.salaryType ?? "MONTHLY";
      setSalaryType(st);
      const amount =
        st === "HOURLY"
          ? (employee.hourlyRate ?? 0)
          : (employee.baseSalary ?? 0);
      setAmountDigits(amount === 0 ? "" : String(amount));
      const noCustomDays = !employee.workDays || employee.workDays.length === 0;
      setUseStoreDays(noCustomDays);
      setCustomDays(noCustomDays ? [] : employee.workDays);
    }
  }, [type, employee]);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["store-roles", storeId],
    queryFn: async () => {
      const res = await storeRoleService.getAll(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: employeeRoles = [], isLoading: isLoadingEmpRoles } = useQuery({
    queryKey: ["employee-roles", storeId, employee?.id],
    queryFn: async () => {
      const res = await employeeService.getRoles(storeId!, employee!.id);
      return res.data.data;
    },
    enabled: type === "edit" && !!storeId && !!employee,
  });

  const employeeRoleIds = employeeRoles.map((r: any) => r.id);

  const { mutate: createEmployee, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      employeeService.create(storeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
      navigateBackOrTo(navigate, paths.employees.index);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi thêm nhân viên");
    },
  });

  const { mutate: updateSalary, isPending: isUpdatingSalary } = useMutation({
    mutationFn: (dto: UpdateSalaryDto) =>
      employeeService.updateSalary(storeId!, employee!.id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
      navigateBackOrTo(navigate, paths.employees.index);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật lương");
    },
  });

  const { mutate: assignRoles } = useMutation({
    mutationFn: (roleIds: number[]) =>
      employeeService.assignRoles(storeId!, employee!.id, { roleIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-roles", storeId, employee?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gán vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({
    resolver: createEmployeeResolver,
    defaultValues: {
      phone: "",
      roleIds: [],
      salaryType: "MONTHLY",
      baseSalary: 0,
      hourlyRate: null,
      workDays: [],
    },
  });

  const selectedRoleIds = watch("roleIds") || [];

  const handleToggleRoleCreate = (roleId: number) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index > -1) {
      if (current.length === 1) return;
      current.splice(index, 1);
    } else {
      current.push(roleId);
    }
    setValue("roleIds", current, { shouldValidate: true });
  };

  const handleToggleRoleEdit = (roleId: number, checked: boolean) => {
    if (updatingRoleId !== null) return;
    if (
      !checked &&
      employeeRoleIds.length === 1 &&
      employeeRoleIds.includes(roleId)
    )
      return;

    let newRoleIds = [...employeeRoleIds];
    if (checked) {
      if (!newRoleIds.includes(roleId)) newRoleIds.push(roleId);
    } else {
      newRoleIds = newRoleIds.filter((id: number) => id !== roleId);
    }

    setUpdatingRoleId(roleId);
    assignRoles(newRoleIds);
  };

  const handleSalaryTypeChange = (type: "MONTHLY" | "HOURLY") => {
    setSalaryType(type);
    setValue("salaryType", type);
    setAmountDigits("");
  };

  const handleAmountChange = (raw: string) => {
    const digits = digitsFromMoneyInput(raw);
    setAmountDigits(digits);
    const num = Number(digits || "0");
    if (salaryType === "MONTHLY") {
      setValue("baseSalary", num);
      setValue("hourlyRate", null);
    } else {
      setValue("hourlyRate", num);
      setValue("baseSalary", 0);
    }
  };

  const toggleCustomDay = (val: number) => {
    const next = customDays.includes(val)
      ? customDays.filter((d) => d !== val)
      : [...customDays, val].sort((a, b) => a - b);
    setCustomDays(next);
    setValue("workDays", useStoreDays ? [] : next);
  };

  const handleScheduleModeChange = (storeDays: boolean) => {
    setUseStoreDays(storeDays);
    setValue("workDays", storeDays ? [] : customDays);
  };

  // Create mode submit
  const onCreateSubmit = (data: CreateEmployeeDto) => {
    createEmployee(data);
  };

  // Edit mode submit (salary only)
  const onEditSubmit = () => {
    const amount = Number(amountDigits || "0");
    const dto: UpdateSalaryDto = {
      salaryType,
      baseSalary: salaryType === "MONTHLY" ? amount : 0,
      hourlyRate: salaryType === "HOURLY" ? amount : null,
      workDays: useStoreDays ? [] : customDays,
    };
    updateSalary(dto);
  };

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  const isLoading = isLoadingRoles || (type === "edit" && isLoadingEmpRoles);
  const isPending = isCreating || isUpdatingSalary || updatingRoleId !== null;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      {isPending && <LoadingOverlay />}

      <Header
        title={type === "create" ? "Thêm Nhân Viên" : "Sửa Nhân Viên"}
        Icon={Users}
        backUrl={paths.employees.index}
      >
        {type === "create" ? (
          <button
            type="submit"
            form="employee-form"
            disabled={isPending}
            className="text-(--color-primary) disabled:opacity-50"
          >
            <CheckCircle size={24} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onEditSubmit}
            disabled={isPending}
            className="text-(--color-primary) disabled:opacity-50"
          >
            <CheckCircle size={24} />
          </button>
        )}
      </Header>

      {type === "create" ? (
        <form
          id="employee-form"
          onSubmit={handleSubmit(onCreateSubmit, onError)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-auto pb-6">
            {/* Phone */}
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
              <span className="font-medium text-sm text-(--color-text-main) flex-none">
                Số điện thoại
              </span>
              <input
                autoFocus
                type="tel"
                placeholder="0901234567"
                {...register("phone")}
                className="flex-1 text-right text-sm"
              />
            </div>

            {/* Salary type */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Loại lương
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {(["MONTHLY", "HOURLY"] as const).map((type) => (
                <label
                  key={type}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <span className="text-sm text-(--color-text-main)">
                    {type === "MONTHLY" ? "Lương tháng" : "Lương giờ"}
                  </span>
                  <input
                    type="radio"
                    name="salaryTypeRadio"
                    checked={salaryType === type}
                    onChange={() => handleSalaryTypeChange(type)}
                    className="text-(--color-primary) size-4"
                  />
                </label>
              ))}
            </div>

            {/* Amount */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              {salaryType === "MONTHLY" ? "Lương tháng" : "Lương mỗi giờ"}
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-(--color-text-secondary) flex-none">
                ₫
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInputDisplay(amountDigits)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="flex-1 text-right text-sm"
              />
            </div>
            <p className="px-4 pt-1 text-xs text-(--color-text-secondary)">
              {salaryType === "MONTHLY"
                ? "Lương đủ công trong 1 tháng"
                : "Tiền nhận cho mỗi giờ làm việc"}
            </p>

            {/* Schedule */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Lịch làm
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                <span className="text-sm text-(--color-text-main)">
                  Dùng lịch cửa hàng
                </span>
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={useStoreDays}
                  onChange={() => handleScheduleModeChange(true)}
                  className="text-(--color-primary) size-4"
                />
              </label>
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                <span className="text-sm text-(--color-text-main)">
                  Lịch riêng
                </span>
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={!useStoreDays}
                  onChange={() => handleScheduleModeChange(false)}
                  className="text-(--color-primary) size-4"
                />
              </label>
            </div>

            {!useStoreDays && (
              <>
                <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
                  Ngày làm
                </h3>
                <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex flex-wrap gap-2">
                  {DAY_LABELS.map(({ value, label }) => {
                    const checked = customDays.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleCustomDay(value)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold border transition-colors",
                          checked
                            ? "bg-(--color-primary) text-white border-(--color-primary)"
                            : "bg-(--color-bg-main) text-(--color-text-secondary) border-(--color-border-main)",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Roles */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Vai trò
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {roles.length === 0 ? (
                <div className="text-center py-4 text-(--color-text-secondary) italic text-xs">
                  Chưa có vai trò nào được tạo.
                </div>
              ) : (
                roles.map((role: any) => {
                  const isChecked = selectedRoleIds.includes(role.id);
                  const isLastRole = isChecked && selectedRoleIds.length === 1;
                  return (
                    <label
                      key={role.id}
                      onClick={(e) => {
                        if (isLastRole) e.preventDefault();
                      }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 group select-none",
                        isLastRole ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
                      <span className="text-xs font-semibold text-(--color-text-main) group-hover:text-(--color-primary) transition-colors">
                        {role.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRoleCreate(role.id)}
                        className={cn(
                          "rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer",
                          isLastRole && "cursor-not-allowed",
                        )}
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto pb-6">
            {/* Employee info */}
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex flex-col gap-1">
              <span className="font-semibold text-(--color-text-main) text-sm truncate">
                {employee?.user?.name}
              </span>
              <span className="text-xs text-(--color-text-secondary) font-mono">
                {employee?.user?.phone}
              </span>
            </div>

            {/* Warning */}
            <div className="mt-4 mx-4 flex items-start gap-2 text-xs text-(--color-text-secondary)">
              <AlertTriangle
                size={14}
                className="mt-0.5 flex-none text-(--color-warning)"
              />
              <span>Thay đổi này không ảnh hưởng bảng lương đã chốt.</span>
            </div>

            {/* Salary type */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Loại lương
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {(["MONTHLY", "HOURLY"] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                >
                  <span className="text-sm text-(--color-text-main)">
                    {t === "MONTHLY" ? "Lương tháng" : "Lương giờ"}
                  </span>
                  <input
                    type="radio"
                    name="editSalaryType"
                    checked={salaryType === t}
                    onChange={() => handleSalaryTypeChange(t)}
                    className="text-(--color-primary) size-4"
                  />
                </label>
              ))}
            </div>

            {/* Amount */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              {salaryType === "MONTHLY" ? "Lương tháng" : "Lương mỗi giờ"}
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-(--color-text-secondary) flex-none">
                ₫
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInputDisplay(amountDigits)}
                onChange={(e) =>
                  setAmountDigits(digitsFromMoneyInput(e.target.value))
                }
                placeholder="0"
                className="flex-1 text-right text-sm"
              />
            </div>
            <p className="px-4 pt-1 text-xs text-(--color-text-secondary)">
              {salaryType === "MONTHLY"
                ? "Lương đủ công trong 1 tháng"
                : "Tiền nhận cho mỗi giờ làm việc"}
            </p>

            {/* Schedule */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Lịch làm
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                <span className="text-sm text-(--color-text-main)">
                  Dùng lịch cửa hàng
                </span>
                <input
                  type="radio"
                  name="editSchedule"
                  checked={useStoreDays}
                  onChange={() => {
                    setUseStoreDays(true);
                    setCustomDays([]);
                  }}
                  className="text-(--color-primary) size-4"
                />
              </label>
              <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
                <span className="text-sm text-(--color-text-main)">
                  Lịch riêng
                </span>
                <input
                  type="radio"
                  name="editSchedule"
                  checked={!useStoreDays}
                  onChange={() => setUseStoreDays(false)}
                  className="text-(--color-primary) size-4"
                />
              </label>
            </div>

            {!useStoreDays && (
              <>
                <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
                  Ngày làm
                </h3>
                <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex flex-wrap gap-2">
                  {DAY_LABELS.map(({ value, label }) => {
                    const checked = customDays.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setCustomDays((prev) =>
                            prev.includes(value)
                              ? prev.filter((d) => d !== value)
                              : [...prev, value].sort((a, b) => a - b),
                          );
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold border transition-colors",
                          checked
                            ? "bg-(--color-primary) text-white border-(--color-primary)"
                            : "bg-(--color-bg-main) text-(--color-text-secondary) border-(--color-border-main)",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Roles */}
            <h3 className="font-semibold text-(--color-text-secondary) px-4 pt-5 pb-2">
              Vai trò
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {roles.length === 0 ? (
                <div className="text-center py-4 text-(--color-text-secondary) italic text-xs">
                  Chưa có vai trò nào được tạo.
                </div>
              ) : (
                roles.map((role: any) => {
                  const isChecked = employeeRoleIds.includes(role.id);
                  const isLastRole = isChecked && employeeRoleIds.length === 1;
                  const isThisUpdating = updatingRoleId === role.id;
                  const isLockedLast = isLastRole && !isThisUpdating;

                  return (
                    <label
                      key={role.id}
                      onClick={(e) => {
                        if (isThisUpdating || isLastRole) e.preventDefault();
                      }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 group select-none",
                        isThisUpdating && "opacity-60 cursor-not-allowed",
                        isLockedLast && "cursor-not-allowed",
                        !isThisUpdating && !isLastRole && "cursor-pointer",
                      )}
                    >
                      <span className="text-xs font-semibold text-(--color-text-main) group-hover:text-(--color-primary) transition-colors">
                        {role.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {isThisUpdating && (
                          <Loader2
                            size={16}
                            className="animate-spin text-(--color-primary)"
                          />
                        )}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isThisUpdating}
                          onChange={(e) =>
                            handleToggleRoleEdit(role.id, e.target.checked)
                          }
                          className={cn(
                            "rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer disabled:cursor-not-allowed",
                            isLockedLast && "cursor-not-allowed",
                          )}
                        />
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
