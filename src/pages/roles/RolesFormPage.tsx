import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreStore } from "@/stores/store.store";
import { storeRoleResolver, type StoreRoleDto } from "@/schemas/storeRole.schema";

type Props = {
  type: "create" | "edit";
};

export const RolesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const role = location.state?.role;

  useEffect(() => {
    if (type === "edit" && !role) {
      navigate(paths.roles.index, { replace: true });
    }
  }, [type, role, navigate]);

  const { data: modules = [] } = useQuery({
    queryKey: ["store-modules", storeId],
    queryFn: async () => {
      const res = await storeRoleService.getModules(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: StoreRoleDto) =>
      type === "create"
        ? storeRoleService.create(storeId!, data)
        : storeRoleService.update(storeId!, role.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-roles", storeId] });
      navigate(paths.roles.index, { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoreRoleDto>({
    resolver: storeRoleResolver,
    defaultValues: {
      name: role?.name || "",
      permissionCodes: role?.permissions?.map((p: any) => p.permission.code) || [],
    },
  });

  const selectedPermissions = watch("permissionCodes") || [];

  const handleTogglePermission = (code: string) => {
    const current = [...selectedPermissions];
    const index = current.indexOf(code);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(code);
    }
    setValue("permissionCodes", current, { shouldValidate: true });
  };

  const handleToggleModule = (apiCodes: string[], isAllSelected: boolean) => {
    let current = [...selectedPermissions];
    if (isAllSelected) {
      current = current.filter((code) => !apiCodes.includes(code));
    } else {
      const toAdd = apiCodes.filter((code) => !current.includes(code));
      current = [...current, ...toAdd];
    }
    setValue("permissionCodes", current, { shouldValidate: true });
  };

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header
        title={type === "create" ? "Thêm Vai Trò" : "Sửa Vai Trò"}
        Icon={ShieldAlert}
        backUrl={paths.roles.index}
      >
        <button
          type="submit"
          form="role-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id="role-form"
        onSubmit={handleSubmit((data) => mutate(data), onError)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6">
          {/* Role Name */}
          <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
            <span className="font-medium text-sm text-(--color-text-main) flex-none">
              Tên vai trò
            </span>
            <input
              autoFocus
              placeholder="VD: Thu ngân, Phục vụ..."
              {...register("name")}
              className="flex-1 text-right text-sm"
            />
          </div>

          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Phân quyền chi tiết
          </h3>

          <div className="space-y-4 px-4">
            {modules.map((moduleItem: any) => {
              const apiCodes = moduleItem.apis.map((a: any) => a.code);
              const isModuleAllSelected = apiCodes.every((code: any) =>
                selectedPermissions.includes(code)
              );
              const isModuleSomeSelected =
                apiCodes.some((code: any) => selectedPermissions.includes(code)) &&
                !isModuleAllSelected;

              return (
                <div
                  key={moduleItem.code}
                  className="bg-(--color-bg-surface) border border-(--color-border-main) rounded-lg overflow-hidden transition-all"
                >
                  {/* Module Header */}
                  <div className="bg-gray-50 dark:bg-gray-900/10 px-3 py-2 flex items-center justify-between border-b border-(--color-border-main)">
                    <span className="text-sm font-semibold text-(--color-primary)">
                      {moduleItem.name}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isModuleAllSelected}
                        onChange={() =>
                          handleToggleModule(apiCodes, isModuleAllSelected)
                        }
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = isModuleSomeSelected;
                          }
                        }}
                        className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-(--color-text-secondary) select-none">
                        Tất cả
                      </span>
                    </label>
                  </div>

                  {/* Module Permissions Grid */}
                  <div className="p-3 divide-y divide-gray-100 dark:divide-gray-800">
                    {moduleItem.apis.map((perm: any) => {
                      const isChecked = selectedPermissions.includes(perm.code);
                      return (
                        <label
                          key={perm.code}
                          className="flex items-center justify-between py-2.5 cursor-pointer group select-none first:pt-0 last:pb-0"
                        >
                          <span className="text-xs font-medium text-(--color-text-main) group-hover:text-(--color-primary) transition-colors">
                            {perm.name}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.code)}
                            className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
