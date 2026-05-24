import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeStoreOrders } from "@/realtime/pusher-client";
import { isRealtimeEnabled } from "@/realtime/config";
import { useAuthStore } from "@/stores/auth.store";

type DashboardRealtimeOptions = {
  /** Tab Overview: Hôm nay hay Kỳ */
  overviewTab: "today" | "period";
  /** Ngày bắt đầu & kết thúc kỳ (tab Kỳ) */
  periodFrom: string;
  periodTo: string;
  /** Hôm nay VN để khớp queryKey của tab Hôm nay và slice finance */
  todayVn: string;
};

/**
 * Khi đơn đổi (order.changed), làm mới các query dashboard có chịu tác động.
 * Theo plan: luôn vận hành + slice tài chính hôm nay; và orders kỳ chỉ khi kỳ = hôm nay calendar.
 */
export function useDashboardRealtime(
  storeId: number | undefined,
  opts: DashboardRealtimeOptions,
): void {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const { overviewTab, periodFrom, periodTo, todayVn } = opts;

  useEffect(() => {
    if (!storeId || !token || !isRealtimeEnabled()) return;

    const sub = subscribeStoreOrders(storeId, () => {
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", "operations", storeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboard", "finance", storeId, todayVn, todayVn],
      });

      const periodMeansTodayVN =
        periodFrom === periodTo && periodFrom === todayVn && overviewTab === "period";

      if (periodMeansTodayVN) {
        void queryClient.invalidateQueries({
          queryKey: ["dashboard", "orders", storeId, periodFrom, periodTo],
        });
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [
    overviewTab,
    periodFrom,
    periodTo,
    queryClient,
    storeId,
    token,
    todayVn,
  ]);
}
