import { cn } from "@/lib/cn";
import type { DashboardOrderStatusCount } from "@/types/dashboard";

import { overviewListGroupClass, overviewRowClass } from "./OverviewBand";
import { OverviewSectionTitle } from "./OverviewSectionTitle";

type Props = {
  items: DashboardOrderStatusCount[];
  max?: number;
};

export function StatusPipeline({ items, max = 12 }: Props) {
  if (items.length === 0) return null;

  const list = items.slice(0, max);
  const extra = Math.max(0, items.length - max);

  return (
    <>
      <OverviewSectionTitle>Đơn theo trạng thái</OverviewSectionTitle>
      <div className={cn("", overviewListGroupClass)}>
        {list.map((s, idx) => (
          <div
            key={`${s.statusId ?? "snap"}:${s.name}:${idx}`}
            className={cn(
              overviewRowClass,
              "flex items-center justify-between gap-3 text-sm",
            )}
          >
            <span className="font-medium text-(--color-text-emphasis) min-w-0 truncate">
              {s.name}
            </span>
            <span className="font-semibold tabular-nums text-(--color-primary) shrink-0">
              {s.count}
            </span>
          </div>
        ))}
        {extra > 0 ? (
          <div className={cn(overviewRowClass, "text-sm text-(--color-text-secondary)")}>
            +{extra} trạng thái khác
          </div>
        ) : null}
      </div>
    </>
  );
}
