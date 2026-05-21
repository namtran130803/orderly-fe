import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Pencil,
  CirclePlus,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { storeRoleService } from "@/services/storeRole.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import type { StoreRole } from "@/schemas/storeRole.schema";

export const RolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const canCreate = usePerm(PERMS.store_roles.create);
  const canUpdate = usePerm(PERMS.store_roles.update);
  const canDelete = usePerm(PERMS.store_roles.delete);

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["store-roles", storeId],
    queryFn: async () => {
      const res = await storeRoleService.getAll(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: (roleId: number) => storeRoleService.delete(storeId!, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-roles", storeId] });
      queryClient.invalidateQueries({ queryKey: ["employees", storeId] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi xóa vai trò");
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<StoreRole | null>(null);

  const isPending = isRolesLoading || isDeleting;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header
        title="Vai trò"
        Icon={ShieldAlert}
        backUrl={paths.settings.index}
      >
        {canCreate && (
          <Link to={paths.roles.create} className="text-(--color-primary)">
            <CirclePlus size={24} />
          </Link>
        )}
      </Header>

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isRolesLoading && roles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <ShieldAlert size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có vai trò nào</p>
              </div>
            )}
            {roles.length > 0 && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {roles.map((role: any) => (
                  <div
                    key={role.id}
                    className="px-4 py-3 flex justify-between items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-(--color-text-main) truncate">
                        {role.name}
                      </p>
                      <p className="text-xs text-(--color-text-secondary) mt-1 truncate">
                        {role.permissions && role.permissions.length > 0
                          ? role.permissions.map((p: any) => p.permission.name).join(", ")
                          : "Chưa phân quyền"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-none">
                      {canUpdate && (
                        <Link
                          to={paths.roles.edit(role.id)}
                          state={{ role }}
                          className="text-(--color-warning)"
                        >
                          <Pencil size={20} />
                        </Link>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="text-(--color-danger)"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={`Xóa ${deleteTarget?.name}`}
        description="Vai trò này sẽ bị xóa vĩnh viễn khỏi cửa hàng. Người dùng thuộc vai trò này sẽ mất các quyền tương ứng. Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteRole(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
