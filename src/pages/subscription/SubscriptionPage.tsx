import React, { useEffect } from "react";
import { CreditCard, RefreshCcw, Loader } from "lucide-react";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { subscriptionService } from "@/services/subscription.service";
import { useStoreStore } from "@/stores/store.store";
import { cn } from "@/lib/cn";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "---";

const statusText: Record<string, string> = {
  TRIALING: "Dùng thử",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Hết hạn",
};

const periodSourceText: Record<string, string> = {
  TRIAL: "Dùng thử",
  PAYMENT: "Thanh toán",
  ADMIN_ADJUSTMENT: "Điều chỉnh thủ công",
  LEGACY_GRACE: "Hỗ trợ chuyển đổi",
};

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const store = useStoreStore((s) => s.store);
  const setStore = useStoreStore((s) => s.setStore);
  const storeId = store?.id;

  const currentQuery = useQuery({
    queryKey: ["subscription-current", storeId],
    queryFn: async () => {
      const res = await subscriptionService.current(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await subscriptionService.plans();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!store || !currentQuery.data?.subscription) return;
    setStore({ ...store, subscription: currentQuery.data.subscription });
  }, [currentQuery.data?.subscription, setStore]);

  const checkoutMutation = useMutation({
    mutationFn: (days: number) => subscriptionService.checkout(storeId!, days),
    onSuccess: (res) => {
      navigate(paths.settings.subscriptionCheckout, {
        state: { checkout: res.data.data },
      });
    },
  });

  const subscription = currentQuery.data?.subscription ?? store?.subscription;
  const plans = plansQuery.data ?? [];

  const {
    data: periodsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPeriodsLoading,
  } = useInfiniteQuery({
    queryKey: ["subscription-periods", storeId],
    queryFn: async ({ pageParam }) => {
      const res = await subscriptionService.periods(storeId!, { page: pageParam, limit: 20 });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!storeId,
  });

  const periods = periodsData?.pages.flatMap((p) => p.data) ?? [];
  const isLoading = currentQuery.isLoading || plansQuery.isLoading || isPeriodsLoading;

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
  });


  return (
    <div className="flex-1 flex flex-col relative h-full">
      {(isLoading || checkoutMutation.isPending) && <LoadingOverlay />}
      <Header
        Icon={CreditCard}
        title="Gia hạn"
        subtitle={store?.name}
        backUrl={paths.settings.index}
      >
        <button
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["subscription-current", storeId] });
            queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
          }}
          className="text-(--color-primary)"
        >
          <RefreshCcw size={22} />
        </button>
      </Header>

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0 overflow-auto pb-6">
          <section className="bg-(--color-bg-surface) border-y border-(--color-border-main) p-4 mt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-(--color-text-secondary)">Trạng thái</p>
                <p className="text-lg font-semibold">
                  {subscription ? statusText[subscription.status] : "---"}
                </p>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold border",
                  subscription?.isReadOnly
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200",
                )}
              >
                {subscription?.isReadOnly ? "Read Only" : "Được ghi dữ liệu"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-(--color-text-secondary)">Hết hạn</p>
                <p className="font-medium">{date(subscription?.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-(--color-text-secondary)">Còn lại</p>
                <p className="font-medium">{subscription?.daysRemaining ?? 0} ngày</p>
              </div>
            </div>
          </section>

          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Chọn gói
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => checkoutMutation.mutate(plan.days)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-(--color-text-secondary)">
                    Gia hạn thêm {plan.days} ngày
                  </p>
                </div>
                <span className="font-semibold text-(--color-primary)">
                  {money(plan.price)}
                </span>
              </button>
            ))}
          </div>

          {periods.length > 0 && (
            <>
              <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
                Lịch sử
              </h3>
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {periods.map((period) => (
                  <div key={period.id} className="px-4 py-3">
                    <p className="font-medium">+{period.days} ngày • {periodSourceText[period.source] ?? period.source}</p>
                    <p className="text-xs text-(--color-text-secondary)">{date(period.startsAt)} - {date(period.endsAt)}</p>
                    {/* payment code intentionally hidden */}
                  </div>
                ))}
              </div>
            </>
          )}

          <div ref={sentinelRef} className="h-4" />

          {(isPeriodsLoading || isFetchingNextPage) && (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin text-(--color-primary)" size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
