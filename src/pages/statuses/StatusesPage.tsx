import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Pencil,
  Activity,
  CirclePlus,
  ArrowUpDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import {
  statusService,
  STATUS_TYPE,
  type Status,
} from "@/services/status.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";

export const StatusesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const canCreate = usePerm(PERMS.statuses.create);
  const canUpdate = usePerm(PERMS.statuses.update);
  const canDelete = usePerm(PERMS.statuses.delete);
  const canReorder = usePerm(PERMS.statuses.reorder);

  const { data: statuses = [], isLoading: isStatusesLoading } = useQuery({
    queryKey: ["statuses", storeId],
    queryFn: async () => {
      const res = await statusService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate: deleteStatus, isPending: isDeleting } = useMutation({
    mutationFn: (statusId: number) => statusService.remove(storeId!, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", storeId] });
      setDeleteTarget(null);
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<Status | null>(null);

  const isPending = isStatusesLoading || isDeleting;

  const midCount = statuses.filter((s) => s.type === STATUS_TYPE.MID).length;
  const canAddMore = midCount < 18;

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header
        title="Quy trình"
        Icon={Activity}
        backUrl={paths.settings.index}
      >
        <div className="flex items-center gap-4">
          {midCount > 1 && canReorder && (
            <Link
              to={paths.statuses.reorder}
              className="text-(--color-primary)"
            >
              <ArrowUpDown size={20} />
            </Link>
          )}

          {canAddMore && canCreate && (
            <Link to={paths.statuses.create} className="text-(--color-primary)">
              <CirclePlus size={24} />
            </Link>
          )}
        </div>
      </Header>

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {statuses.map((st) => (
                <div
                  key={st.id}
                  className="px-4 py-3 flex justify-between items-center gap-2"
                >
                  <div className="flex-1">
                    <p className="text-(--color-text-main) truncate">
                      {st.name}
                    </p>

                    <p className="text-(--color-text-secondary) mt-0.5">
                      {st.type === STATUS_TYPE.START
                        ? "Bắt đầu"
                        : st.type === STATUS_TYPE.END
                          ? "Kết thúc"
                          : "Trung gian"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {canUpdate && (
                      <Link
                        to={paths.statuses.edit(st.id)}
                        state={{
                          status: st,
                        }}
                        className="text-(--color-warning)"
                      >
                        <Pencil size={20} />
                      </Link>
                    )}

                    {st.type === STATUS_TYPE.MID && canDelete && (
                      <button
                        onClick={() => setDeleteTarget(st)}
                        className="text-(--color-danger)"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={`Xóa ${deleteTarget?.name}`}
        description="Quy trình này sẽ bị xóa khỏi cửa hàng. Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteStatus(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
