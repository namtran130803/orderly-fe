import { BarChart3, Plus, Minus, Utensils, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { formatMoney } from "@/utils/formatMoney";
import { useStoreStore } from "@/stores/store.store";
import { dashboardService } from "@/services/dashboard.service";

type PeriodType =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth";

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateRange(period: PeriodType) {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);

  if (period === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "yesterday") {
    from.setDate(now.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    to.setDate(now.getDate() - 1);
    to.setHours(23, 59, 59, 999);
  } else if (period === "thisWeek") {
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    from.setDate(now.getDate() - diff);
    from.setHours(0, 0, 0, 0);
  } else if (period === "lastWeek") {
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    from.setDate(now.getDate() - diff - 7);
    from.setHours(0, 0, 0, 0);
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);
  } else if (period === "thisMonth") {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  } else if (period === "lastMonth") {
    from.setDate(1);
    from.setMonth(now.getMonth() - 1);
    from.setHours(0, 0, 0, 0);
    to.setDate(0);
    to.setHours(23, 59, 59, 999);
  }

  return {
    from: toLocalDateStr(from),
    to: toLocalDateStr(to),
  };
}

function getPeriodLabel(period: PeriodType) {
  const now = new Date();
  if (period === "today") {
    return now.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (period === "yesterday") {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return `Hôm qua — ${y.toLocaleDateString("vi-VN")}`;
  }
  if (period === "thisWeek") {
    const from = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    from.setDate(now.getDate() - diff);
    return `Tuần này (${from.toLocaleDateString("vi-VN")} - ${now.toLocaleDateString("vi-VN")})`;
  }
  if (period === "lastWeek") {
    const from = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    from.setDate(now.getDate() - diff - 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return `Tuần trước (${from.toLocaleDateString("vi-VN")} - ${to.toLocaleDateString("vi-VN")})`;
  }
  if (period === "thisMonth") {
    return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
  }
  return `Tháng ${now.getMonth()}/${now.getFullYear()}`;
}

export const OverviewPage: React.FC = () => {
  const store = useStoreStore((s) => s.store);
  const storeId = useStoreStore((s) => s.store?.id);
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<PeriodType>("today");

  const { from, to } = getDateRange(period);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard", storeId, from, to],
    queryFn: async () => {
      const res = await dashboardService.getStats(storeId!, from, to);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["dashboard", storeId, from, to],
    });
  };

  const data = stats || { revenue: 0, expense: 0, orderCount: 0, topItems: [] };

  const periodLabel = getPeriodLabel(period);

  return (
    <div className="flex-1 flex flex-col relative">
      {isLoading && <LoadingOverlay />}
      <Header
        title={store?.name}
        subtitle={store?.address || undefined}
        Icon={BarChart3}
      >
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-(--color-primary) disabled:opacity-50"
          title="Reload"
        >
          <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
        </button>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="p-4 pb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-(--color-text-secondary) text-sm text-nowrap">
                {periodLabel}
              </span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="w-fit"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="thisWeek">Tuần này</option>
                <option value="lastWeek">Tuần trước</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
              </select>
            </div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plus size={20} className="text-(--color-success)" />
                  <span className="font-medium">Doanh thu</span>
                </div>
                <span className="font-semibold text-(--color-success) tabular-nums">
                  {formatMoney(data.revenue)}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Minus size={20} className="text-(--color-danger)" />
                  <span className="font-medium">Chi tiêu</span>
                </div>
                <span className="font-semibold text-(--color-danger) tabular-nums">
                  {formatMoney(data.expense)}
                </span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils size={20} className="text-(--color-warning)" />
                  <span className="font-semibold">Đơn hàng</span>
                </div>
                <span className="font-semibold text-(--color-warning) tabular-nums">
                  {data.orderCount}
                </span>
              </div>
            </div>

            {data.topItems.length > 0 && (
              <>
                <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">
                  Các món bán chạy
                </div>
                <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                  {data.topItems.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{index + 1}.</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="tabular-nums">{item.qty}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
