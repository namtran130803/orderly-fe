import { cn } from "@/lib/cn";
import { formatMoney } from "@/utils/formatMoney";
import type { DashboardTopItem } from "@/types/dashboard";

import { overviewListGroupClass, overviewRowClass } from "./OverviewBand";
import { OverviewSectionTitle } from "./OverviewSectionTitle";

const RANK_COLORS = [
  "text-(--color-warning)",
  "text-(--color-info)",
  "text-(--color-primary)",
  "text-(--color-text-secondary)",
  "text-(--color-text-secondary)",
] as const;

type Props = {
  items: DashboardTopItem[];
  maxItems?: number;
  showRevenue?: boolean;
  title?: string;
};

export function TopItemsList({
  items,
  showRevenue = false,
  title = "Top 5 món",
  maxItems = 5,
}: Props) {
  const list = items?.slice(0, maxItems) ?? [];
  if (!list.length) return null;

  return (
    <>
      <OverviewSectionTitle>{title}</OverviewSectionTitle>
      <div className={cn("", overviewListGroupClass)}>
        {list.map((item, index) => (
          <div
            key={`${item.name}:${index}`}
            className={cn(overviewRowClass, "flex items-start justify-between gap-3")}
          >
            <div className="flex items-start gap-2 min-w-0">
              <span
                className={cn(
                  "text-sm font-bold tabular-nums shrink-0 w-5",
                  RANK_COLORS[index] ?? RANK_COLORS[3],
                )}
              >
                {index + 1}.
              </span>
              <span className="text-sm font-medium text-(--color-text-main) min-w-0 break-words leading-snug">
                {item.name}
              </span>
            </div>
            <div className="shrink-0 text-right tabular-nums flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-(--color-text-main)">
                ×{item.qty}
              </span>
              {showRevenue ? (
                <span className="text-xs font-medium text-(--color-success)">
                  {formatMoney(item.revenue)}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
