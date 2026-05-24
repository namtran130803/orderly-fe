import { BarChart3, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { cn } from "@/lib/cn";
import {
  getOverviewPeriodRangeVN,
  type OverviewPeriodPreset,
  todayVnDateString,
} from "@/lib/date-vn";
import { useStoreStore } from "@/stores/store.store";

import { OverviewPeriodTab } from "./OverviewPeriodTab";
import { OverviewTodayTab } from "./OverviewTodayTab";

const OVERVIEW_TABS = [{ id: "today" as const }, { id: "period" as const }];

export const OverviewPage: React.FC = () => {
  const store = useStoreStore((s) => s.store);
  const storeId = useStoreStore((s) => s.store?.id);
  const queryClient = useQueryClient();

  const [overviewTab, setOverviewTab] = useState<"today" | "period">("today");

  const [periodPreset, setPeriodPreset] = useState<OverviewPeriodPreset>(
    "thisMonth",
  );

  const todayAnchor = todayVnDateString();

  const { from: periodFrom, to: periodTo } = useMemo(
    () => getOverviewPeriodRangeVN(periodPreset),
    [periodPreset],
  );

  const swipeHandlers = useSwipeTabs({
    items: OVERVIEW_TABS,
    currentId: overviewTab,
    setCurrentId: setOverviewTab,
    enabled: true,
  });

  useDashboardRealtime(storeId, {
    overviewTab,
    periodFrom,
    periodTo,
    todayVn: todayAnchor,
  });

  const handleRefresh = () => {
    if (!storeId) return;

    if (overviewTab === "today") {
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", "operations", storeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", "finance", storeId, todayAnchor, todayAnchor],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", "staff", storeId, todayAnchor, todayAnchor],
      });
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ["dashboard", "finance", storeId, periodFrom, periodTo],
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboard", "orders", storeId, periodFrom, periodTo],
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboard", "staff", storeId, periodFrom, periodTo],
    });
  };

  const fetchingAny =
    useIsFetching({
      predicate: (q) => {
        const k = q.queryKey as unknown[];
        if (k[0] !== "dashboard" || !storeId || k[2] !== storeId)
          return false;
        if (overviewTab === "today") {
          const op = k[1];
          const financeTodaySlice =
            op === "finance" && k[3] === todayAnchor && k[4] === todayAnchor;
          const staffTodaySlice =
            op === "staff" && k[3] === todayAnchor && k[4] === todayAnchor;
          return op === "operations" || financeTodaySlice || staffTodaySlice;
        }
        const op = k[1];
        const sameRange = k[3] === periodFrom && k[4] === periodTo;
        return (
          sameRange && (op === "finance" || op === "orders" || op === "staff")
        );
      },
    }) > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <Header
        title={store?.name}
        subtitle={store?.address || undefined}
        Icon={BarChart3}
      >
        <button
          onClick={() => handleRefresh()}
          disabled={!storeId}
          title="Reload"
          className="text-(--color-primary) disabled:opacity-50"
        >
          <RefreshCw
            size={24}
            className={fetchingAny ? "animate-spin" : undefined}
          />
        </button>
      </Header>

      <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto shrink-0">
        <button
          type="button"
          role="tab"
          aria-selected={overviewTab === "today"}
          onClick={() => setOverviewTab("today")}
          className={cn(
            "flex-1 px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2",
            overviewTab === "today"
              ? "border-(--color-primary) text-(--color-primary)"
              : "border-transparent text-(--color-text-secondary)",
          )}
        >
          Hôm nay
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={overviewTab === "period"}
          onClick={() => setOverviewTab("period")}
          className={cn(
            "flex-1 px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2",
            overviewTab === "period"
              ? "border-(--color-primary) text-(--color-primary)"
              : "border-transparent text-(--color-text-secondary)",
          )}
        >
          Kỳ
        </button>
      </div>

      {overviewTab === "period" ? (
        <div className="shrink-0 bg-(--color-bg-surface) border-b border-(--color-border-main) px-4 py-2">
          <select
            id="overview-period-preset"
            value={periodPreset}
            aria-label="Khoảng thống kê"
            onChange={(e) =>
              setPeriodPreset(e.target.value as OverviewPeriodPreset)
            }
            className="w-full text-sm bg-(--color-bg-surface) text-(--color-text-main) font-medium border-0 outline-none"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="thisWeek">Tuần này</option>
            <option value="lastWeek">Tuần trước</option>
            <option value="thisMonth">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
          </select>
        </div>
      ) : null}

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0 flex" {...swipeHandlers}>
          <div className="relative flex-1 min-h-0 overflow-auto pb-4">
            {!storeId ? (
              <p className="p-4 text-(--color-text-secondary)">
                Chọn cửa hàng để xem thống kê.
              </p>
            ) : overviewTab === "today" ? (
              <OverviewTodayTab storeId={storeId} />
            ) : (
              <OverviewPeriodTab
                storeId={storeId}
                from={periodFrom}
                to={periodTo}
                periodPreset={periodPreset}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
