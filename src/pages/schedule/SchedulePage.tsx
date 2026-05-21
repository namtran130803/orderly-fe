import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, CheckCircle, X, Trash2, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { scheduleService } from "@/services/schedule.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { cn } from "@/lib/cn";

const DAYS: { iso: number; label: string }[] = [
  { iso: 1, label: "Hai" },
  { iso: 2, label: "Ba" },
  { iso: 3, label: "Tư" },
  { iso: 4, label: "Năm" },
  { iso: 5, label: "Sáu" },
  { iso: 6, label: "Bảy" },
  { iso: 7, label: "Chủ nhật" },
];

const OVERRIDE_TYPE_LABEL: Record<string, string> = {
  OFF: "Nghỉ",
  WORKING_DAY: "Làm bù",
};

function overrideTypeClass(type: string): string {
  switch (type) {
    case "OFF":
      return "text-(--color-danger)";
    case "WORKING_DAY":
      return "text-(--color-success)";
    default:
      return "text-(--color-text-secondary)";
  }
}

export const SchedulePage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const qc = useQueryClient();
  const canManage = usePerm(PERMS.schedule.manage);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", storeId],
    queryFn: async () => {
      const res = await scheduleService.get(storeId!);
      return res.data.data as {
        defaultWorkDays: number[];
        overrides: { id: number; date: string; type: string }[];
      };
    },
    enabled: !!storeId,
  });

  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (data?.defaultWorkDays) setSelected([...data.defaultWorkDays]);
  }, [data?.defaultWorkDays]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => scheduleService.putDefault(storeId!, selected),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule"] });
    },
  });

  const { mutate: removeOv, isPending: removing } = useMutation({
    mutationFn: (overrideId: number) =>
      scheduleService.deleteOverride(storeId!, overrideId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });

  const toggle = (iso: number) => {
    setSelected((cur) =>
      cur.includes(iso)
        ? cur.filter((x) => x !== iso)
        : [...cur, iso].sort((a, b) => a - b),
    );
  };

  const pending = isPending || removing;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {(isLoading || pending) && <LoadingOverlay />}
      <Header
        title="Lịch làm"
        Icon={CalendarRange}
        backUrl={paths.settings.index}
      >
        {canManage && (
          <button
            type="button"
            onClick={() => save()}
            disabled={pending || selected.length === 0}
            className="text-(--color-primary) disabled:opacity-50"
          >
            <CheckCircle size={24} />
          </button>
        )}
      </Header>

      <div className="flex-1 overflow-auto pb-6 mt-4">
        <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">
          Ngày làm mặc định
        </h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          {DAYS.map((d) => {
            const on = selected.includes(d.iso);
            return (
              <button
                type="button"
                key={d.iso}
                onClick={() => canManage && toggle(d.iso)}
                disabled={!canManage}
                className="w-full px-4 py-3 flex items-center justify-between disabled:opacity-50"
              >
                <span className="text-sm font-semibold text-(--color-text-main)">
                  {d.label}
                </span>
                {on ? (
                  <Check size={20} className="text-(--color-success)" />
                ) : (
                  <X size={20} className="text-(--color-danger)" />
                )}
              </button>
            );
          })}
        </div>

        <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
          Ngày đặc biệt
        </h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          {(data?.overrides?.length ?? 0) === 0 && (
            <div className="px-4 py-4 text-sm text-(--color-text-muted) text-center">
              Chưa có ngày đặc biệt
            </div>
          )}
          {data?.overrides?.map((o) => (
            <div
              key={o.id}
              className="px-4 py-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-(--color-text-main)">
                  {o.date}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    overrideTypeClass(o.type),
                  )}
                >
                  {OVERRIDE_TYPE_LABEL[o.type] ?? o.type}
                </span>
              </div>
              {canManage && (
                <button
                  type="button"
                  className="text-(--color-danger)"
                  onClick={() => removeOv(o.id)}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        {canManage && (
          <Link
            to={paths.schedule.overrideCreate}
            className="mt-6 block w-full py-3 text-sm font-semibold text-center border-y border-(--color-border-main) bg-(--color-bg-surface) text-(--color-primary)"
          >
            Thêm ngày đặc biệt
          </Link>
        )}
      </div>
    </div>
  );
};
