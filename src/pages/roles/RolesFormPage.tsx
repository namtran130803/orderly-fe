import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { navigateBackOrTo } from "@/lib/browser-history";
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
      navigateBackOrTo(navigate, paths.roles.index);
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
            Phân quyền
          </h3>

          <div className="space-y-4">
            {modules.map((moduleItem: any) => {
              const apiCodes = moduleItem.apis.map((a: any) => a.code);
              const isModuleAllSelected = apiCodes.every((code: any) =>
                selectedPermissions.includes(code)
              );
              const isModuleSomeSelected =
                apiCodes.some((code: any) => selectedPermissions.includes(code)) &&
                !isModuleAllSelected;

              const permissionRows: any[][] = [];
              for (let i = 0; i < moduleItem.apis.length; i += 2) {
                permissionRows.push(moduleItem.apis.slice(i, i + 2));
              }

              return (
                <div
                  key={moduleItem.code}
                  className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)"
                >
                  {/* Module Header */}
                  <div className="px-3 py-2 flex items-center justify-between">
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

                  <div className="px-3 py-2">
                    <table className="w-full border-collapse table-fixed">
                      <tbody>
                        {permissionRows.map((pair, rowIdx) => (
                          <tr
                            key={`${moduleItem.code}-${rowIdx}`}
                            className={
                              rowIdx > 0
                                ? "border-t border-(--color-border-main)"
                                : undefined
                            }
                          >
                            {[pair[0], pair[1] ?? null].map((perm, colIdx) => (
                              <td
                                key={
                                  perm
                                    ? perm.code
                                    : `${moduleItem.code}-${rowIdx}-empty-${colIdx}`
                                }
                                className={
                                  colIdx === 0
                                    ? "w-1/2 py-2 pr-4 align-middle border-r border-(--color-border-main)"
                                    : "w-1/2 py-2 pl-4 align-middle"
                                }
                              >
                                {perm ? (
                                  <label className="flex items-center justify-between gap-2 cursor-pointer group select-none min-w-0">
                                    <span className="text-xs font-medium text-(--color-text-main) group-hover:text-(--color-primary) transition-colors min-w-0 truncate">
                                      {perm.name}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissions.includes(
                                        perm.code
                                      )}
                                      onChange={() =>
                                        handleTogglePermission(perm.code)
                                      }
                                      className="shrink-0 rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) size-4 cursor-pointer"
                                    />
                                  </label>
                                ) : null}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
