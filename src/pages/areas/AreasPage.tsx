import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Grid, CirclePlus, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import {
  areaService,
  tableService,
  type Area,
  type Table,
} from "@/services/area.service";
import { useStoreStore } from "@/stores/store.store";

export const AreasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { data: areas = [], isLoading: isAreasLoading } = useQuery({
    queryKey: ["areas", storeId],
    queryFn: async () => {
      const res = await areaService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: allTables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ["tables", storeId],
    queryFn: async () => {
      const res = await tableService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const tablesByArea = allTables.reduce((acc: Record<number, Table[]>, t) => {
    if (!acc[t.areaId]) acc[t.areaId] = [];
    acc[t.areaId].push(t);
    return acc;
  }, {});

  const { mutate: deleteArea, isPending: isDeletingArea } = useMutation({
    mutationFn: (areaId: number) => areaService.remove(storeId!, areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas", storeId] });
      queryClient.invalidateQueries({ queryKey: ["tables", storeId] });
    },
  });

  const { mutate: deleteTable, isPending: isDeletingTable } = useMutation({
    mutationFn: (tableId: number) => tableService.remove(storeId!, tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", storeId] });
    },
  });

  const [deleteAreaTarget, setDeleteAreaTarget] = useState<Area | null>(null);
  const [deleteTableTarget, setDeleteTableTarget] = useState<Table | null>(
    null,
  );

  const isPending =
    isAreasLoading || isTablesLoading || isDeletingArea || isDeletingTable;
  const isLoading = isAreasLoading || isTablesLoading;

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header title="Khu vực & Bàn" Icon={Grid} backUrl={paths.settings.index}>
        <div className="flex items-center gap-4">
          {areas.length > 1 && (
            <Link to={paths.areas.reorder} className="text-(--color-primary)">
              <ArrowUpDown size={20} />
            </Link>
          )}
          <Link to={paths.areas.create} className="text-(--color-primary)">
            <CirclePlus size={24} />
          </Link>
        </div>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && areas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <Grid size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có khu vực nào</p>
              </div>
            )}
            {areas.map((area) => {
              const areaTables = tablesByArea[area.id] || [];
              return (
                <div key={area.id}>
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span className="font-semibold text-(--color-text-secondary) truncate tabular-nums">
                      {area.name}
                    </span>

                    <div className="flex items-center gap-4">
                      <Link
                        replace
                        to={paths.areas.edit(area.id)}
                        state={{ area, tableCount: areaTables.length }}
                        className="text-(--color-warning)"
                      >
                        <Pencil size={20} />
                      </Link>

                      <button
                        onClick={() => setDeleteAreaTarget(area)}
                        className="text-(--color-danger)"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                    {areaTables.map((t) => (
                      <div
                        key={t.id}
                        className="px-4 py-3 flex justify-between items-center gap-2"
                      >
                        <div className="flex-1">
                          <p className="text-(--color-text-main) truncate">
                            {t.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Link
                            replace
                            to={paths.areas.tables.edit(t.id)}
                            state={{ table: t }}
                            className="text-(--color-warning)"
                          >
                            <Pencil size={20} />
                          </Link>

                          <button
                            onClick={() => setDeleteTableTarget(t)}
                            className="text-(--color-danger)"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteAreaTarget !== null}
        title={`Xóa ${deleteAreaTarget?.name}`}
        description="Toàn bộ bàn trong khu vực này sẽ bị xóa. Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteAreaTarget) deleteArea(deleteAreaTarget.id);
          setDeleteAreaTarget(null);
        }}
        onCancel={() => setDeleteAreaTarget(null)}
      />

      <ConfirmDialog
        isOpen={deleteTableTarget !== null}
        title={`Xóa ${deleteTableTarget?.name}`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteTableTarget) deleteTable(deleteTableTarget.id);
          setDeleteTableTarget(null);
        }}
        onCancel={() => setDeleteTableTarget(null)}
      />
    </div>
  );
};
