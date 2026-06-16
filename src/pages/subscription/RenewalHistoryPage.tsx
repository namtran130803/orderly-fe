import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { CalendarClock, Loader } from "lucide-react";
import { Header } from "@/components/Header";
import {
  subscriptionService,
  type SubscriptionPeriod,
} from "@/services/subscription.service";
import { useStoreStore } from "@/stores/store.store";

const sourceText: Record<SubscriptionPeriod["source"], string> = {
  TRIAL: "Dùng thử",
  PAYMENT: "Thanh toán",
  ADMIN_ADJUSTMENT: "Gia hạn thủ công",
  LEGACY_GRACE: "Gia hạn chuyển tiếp",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const RenewalHistoryPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["subscription-periods", storeId],
      queryFn: async ({ pageParam }) => {
        const res = await subscriptionService.periods(storeId!, {
          page: pageParam,
          limit: 20,
        });
        return res.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination.page < lastPage.pagination.totalPages
          ? lastPage.pagination.page + 1
          : undefined,
      enabled: !!storeId,
    });

  const periods = data?.pages.flatMap((page) => page.data) ?? [];

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const groupedPeriods = periods.reduce(
    (acc: Record<string, SubscriptionPeriod[]>, period) => {
      const dateKey = period.startsAt.split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(period);
      return acc;
    },
    {},
  );

  const groupDates = Object.keys(groupedPeriods).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="flex-1 flex flex-col relative">
      <Header Icon={CalendarClock} title="Lịch sử gia hạn" />

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && periods.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-(--color-text-muted)">
                <CalendarClock size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Chưa có lịch sử gia hạn</p>
              </div>
            )}

            {!isLoading &&
              groupDates.map((dateKey) => {
                const [y, m, d] = dateKey.split("-").map(Number);
                const dateLabel = new Date(y, m - 1, d).toLocaleDateString(
                  "vi-VN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                );

                return (
                  <div key={dateKey}>
                    <div className="sticky top-0 z-10 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
                      <h3 className="p-4 pb-2 text-sm font-semibold text-(--color-text-secondary)">
                        {dateLabel}
                      </h3>
                    </div>

                    <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                      {groupedPeriods[dateKey].map((period) => (
                        <div
                          key={period.id}
                          className="flex items-start justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                +{period.days} ngày
                              </h4>
                              <span className="rounded-full bg-(--color-bg-main) px-2 py-0.5 text-xs text-(--color-text-secondary)">
                                {sourceText[period.source]}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-(--color-text-secondary)">
                              {formatDate(period.startsAt)} -{" "}
                              {formatDate(period.endsAt)}
                            </p>
                            {period.payment?.paymentCode && (
                              <p className="mt-1 text-xs text-(--color-text-muted)">
                                Mã thanh toán: {period.payment.paymentCode}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            <div ref={sentinelRef} className="h-4" />

            {(isLoading || isFetchingNextPage) && (
              <div className="flex items-center justify-center py-4">
                <Loader
                  size={20}
                  className="animate-spin text-(--color-primary)"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
