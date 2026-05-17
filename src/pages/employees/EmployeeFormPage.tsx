import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { employeeService } from "@/services/employee.service";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreStore } from "@/stores/store.store";
import { createEmployeeResolver, type CreateEmployeeDto } from "@/schemas/employee.schema";

type Props = {
  type: "create" | "edit";
};

export const EmployeeFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const employee = location.state?.employee;

  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (type === "edit" && !employee) {
      navigate(paths.employees.index, { replace: true });
    }
  }, [type, employee, navigate]);

  // Fetch all available roles in the store
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["store-roles", storeId],
    queryFn: async () => {
      const res = await storeRoleService.getAll(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  // Fetch active roles for the employee (only in edit mode)
  const { data: employeeRoles = [], isLoading: isLoadingEmpRoles } = useQuery({
    queryKey: ["employee-roles", storeId, employee?.id],
    queryFn: async () => {
      const res = await employeeService.getRoles(storeId!, employee.id);
      return res.data.data;
    },
    enabled: type === "edit" && !!storeId && !!employee,
  });

  const employeeRoleIds = employeeRoles.map((r: any) => r.id);

  // Mutation to create employee
  const { mutate: createEmployee, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeService.create(storeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
      navigate(paths.employees.index, { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi thêm nhân viên");
    },
  });

  // Mutation to assign roles
  const { mutate: assignRoles } = useMutation({
    mutationFn: (roleIds: number[]) => {
      return employeeService.assignRoles(storeId!, employee.id, { roleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", storeId, employee?.id] });
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi gán vai trò");
    },
    onSettled: () => setUpdatingRoleId(null),
  });

  // Form for creation mode
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
    },
  });

  const selectedRoleIds = watch("roleIds") || [];

  const handleToggleRoleCreate = (roleId: number) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(roleId);
    }
    setValue("roleIds", current, { shouldValidate: true });
  };

  const handleToggleRoleEdit = (roleId: number, checked: boolean) => {
    if (updatingRoleId !== null) return;
    
    let newRoleIds = [...employeeRoleIds];
    if (checked) {
      if (!newRoleIds.includes(roleId)) {
        newRoleIds.push(roleId);
      }
    } else {
      newRoleIds = newRoleIds.filter((id: number) => id !== roleId);
    }

    setUpdatingRoleId(roleId);
    assignRoles(newRoleIds);
  };

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  const isLoading = isLoadingRoles || (type === "edit" && isLoadingEmpRoles);
  const isPending = isCreating || updatingRoleId !== null;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      {isPending && <LoadingOverlay />}

      <Header
        title={type === "create" ? "Thêm Nhân Viên" : "Vai Trò Nhân Viên"}
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
            onClick={() => navigate(paths.employees.index, { replace: true })}
            className="text-(--color-primary)"
          >
            <CheckCircle size={24} />
          </button>
        )}
      </Header>

      {type === "create" ? (
        <form
          id="employee-form"
          onSubmit={handleSubmit((data) => createEmployee(data), onError)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-auto pb-6">
            {/* Phone Input */}
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
              <span className="font-medium text-sm text-(--color-text-main) flex-none">
                Số điện thoại
              </span>
              <input
                autoFocus
                type="tel"
                placeholder="VD: 0901234567..."
                {...register("phone")}
                className="flex-1 text-right text-sm"
              />
            </div>

            <h3 className="font-semibold text-xs text-(--color-text-secondary) p-4 pb-2 uppercase tracking-wider">
              Chọn vai trò
            </h3>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-100 dark:divide-gray-800">
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
                      onClick={(e) => { if (isLastRole) e.preventDefault(); }}
                      className={`flex items-center justify-between px-4 py-3 group select-none ${isLastRole ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="text-xs font-semibold text-(--color-text-main) group-hover:text-(--color-primary) transition-colors">
                        {role.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLastRole}
                        onChange={() => handleToggleRoleCreate(role.id)}
                        className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer disabled:cursor-not-allowed"
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
            {/* Employee Summary Card */}
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex flex-col gap-1">
              <span className="font-semibold text-(--color-text-main) text-sm truncate">
                {employee?.user?.name}
              </span>
              <span className="text-xs text-(--color-text-secondary) font-mono">
                {employee?.user?.phone}
              </span>
            </div>

            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
              Các vai trò
            </h3>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-100 dark:divide-gray-800">
              {roles.length === 0 ? (
                <div className="text-center py-4 text-(--color-text-secondary) italic text-xs">
                  Chưa có vai trò nào được tạo.
                </div>
              ) : (
                roles.map((role: any) => {
                  const isChecked = employeeRoleIds.includes(role.id);
                  const isLastRole = isChecked && employeeRoleIds.length === 1;
                  const isThisUpdating = updatingRoleId === role.id;
                  const isDisabled = isThisUpdating || isLastRole;

                  return (
                    <label
                      key={role.id}
                      onClick={(e) => {
                        if (isDisabled) e.preventDefault();
                      }}
                      className={`flex items-center justify-between px-4 py-3 group select-none ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="text-xs font-semibold text-(--color-text-main) group-hover:text-(--color-primary) transition-colors">
                        {role.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {isThisUpdating && (
                          <Loader2 size={16} className="animate-spin text-(--color-primary)" />
                        )}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) => handleToggleRoleEdit(role.id, e.target.checked)}
                          className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer disabled:cursor-not-allowed"
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
