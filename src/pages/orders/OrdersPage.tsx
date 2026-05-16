import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Utensils,
  Info,
  Edit3,
  Trash2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  CirclePlus,
  Loader,
} from "lucide-react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { cn } from "@/lib/cn";
import { groupItems } from "@/utils/groupItems";
import { formatId, formatTime } from "@/utils/format";
import { orderService, type Order } from "@/services/order.service";
import { statusService } from "@/services/status.service";
import { useStoreStore } from "@/stores/store.store";
import { useOrderStore } from "@/stores/order.store";

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const clearOrder = useOrderStore((s) => s.clearOrder);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  useEffect(() => {
    clearOrder();
  }, [clearOrder]);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusIdParam = searchParams.get("statusId");

  const { data: statuses = [], isLoading: isStatusesLoading } = useQuery({
    queryKey: ["statuses", storeId],
    queryFn: async () => {
      const res = await statusService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const currentStatusId = statusIdParam
    ? Number(statusIdParam)
    : statuses[0]?.id;

  const currentIdx = statuses.findIndex((s) => s.id === currentStatusId);
  const isEndFilter = currentIdx === statuses.length - 1;
  const isStartFilter = currentIdx === 0;
  const sortOrder: "asc" | "desc" = isEndFilter ? "desc" : "asc";

  const {
    data: ordersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isOrdersLoading,
  } = useInfiniteQuery({
    queryKey: ["orders", storeId, currentStatusId, sortOrder],
    queryFn: async ({ pageParam }) => {
      const res = await orderService.list(storeId!, {
        statusId: currentStatusId,
        limit: 20,
        cursor: pageParam,
        sortOrder,
      });
      return res.data;
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!storeId && !!currentStatusId && currentIdx !== -1,
  });

  const orders = ordersData?.pages.flatMap((page) => page.data) || [];

  const filteredOrders = orders
    .map((o) => ({
      ...o,
      items: o.items.filter((item) => item.statusId === currentStatusId),
    }))
    .filter((o) => o.items.length > 0);

  const { mutate: advanceOrder, isPending: isAdvancing } = useMutation({
    mutationFn: (orderId: number) =>
      orderService.advance(storeId!, orderId, {
        fromStatusId: currentStatusId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", storeId] });
    },
  });

  const { mutate: revertOrder, isPending: isReverting } = useMutation({
    mutationFn: (orderId: number) =>
      orderService.revert(storeId!, orderId, { fromStatusId: currentStatusId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", storeId] });
    },
  });

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: (orderId: number) => orderService.remove(storeId!, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", storeId] });
      setDeleteTarget(null);
    },
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const setStatusId = (id: number) => {
    setSearchParams({ statusId: String(id) }, { replace: true });
  };

  const swipeHandlers = useSwipeTabs({
    items: statuses,
    currentId: currentStatusId,
    setCurrentId: setStatusId,
    enabled: !!currentStatusId,
  });

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }, 50);
  };

  useEffect(() => {
    if (currentStatusId) {
      scrollTabIntoView(`status-tab-${currentStatusId}`);
      if (!statusIdParam && statuses[0]) {
        setStatusId(statuses[0].id);
      }
    }
  }, [currentStatusId, statusIdParam, statuses]);

  const isLoading =
    isStatusesLoading ||
    isOrdersLoading ||
    isAdvancing ||
    isReverting ||
    isDeleting;

  return (
    <div className="flex-1 flex flex-col relative">
      {isLoading && <LoadingOverlay />}
      <Header title="Đơn Hàng" Icon={Utensils}>
        <Link to={paths.orders.selectTable} className="text-(--color-primary)">
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto">
        {statuses.map((s) => {
          const isActive = currentStatusId === s.id;
          return (
            <button
              key={s.id}
              id={`status-tab-${s.id}`}
              onClick={() => setStatusId(s.id)}
              className={cn(
                "px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 flex items-center gap-1",
                isActive && "border-(--color-primary) text-(--color-primary)",
                !isActive && "border-transparent text-(--color-text-secondary)",
              )}
            >
              {s.name}
              {isActive && <span>({filteredOrders.length})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 relative" {...swipeHandlers}>
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <Utensils size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có đơn nào</p>
              </div>
            )}

            {filteredOrders.map((o) => {
              const uniqueNames = new Set(o.items.map((i) => i.nameSnapshot));
              const itemCount = uniqueNames.size;
              const portionCount = o.items.reduce((acc, i) => acc + i.qty, 0);

              return (
                <div
                  key={o.id}
                  className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) flex flex-col"
                >
                  <div className="px-4 h-10 flex justify-between items-center border-b border-(--color-border-main)">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-(--color-text-main)">
                        #{formatId(o.id)}
                      </span>
                      <span className="text-(--color-text-muted)">•</span>
                      <span className="font-semibold text-(--color-text-main)">
                        {o.tableSnapshot || "Mang về"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          useOrderStore.getState().clearCart();
                          useOrderStore.getState().setTable(
                            o.tableId
                              ? {
                                  id: o.tableId,
                                  name: o.tableSnapshot || `Bàn ${o.tableId}`,
                                }
                              : null,
                          );
                          useOrderStore.getState().setEditingOrder(o.id);
                          useOrderStore.getState().setCart(
                            o.items.map((item) => ({
                              menuItemId: item.menuItemId,
                              name: item.nameSnapshot,
                              price: item.priceSnapshot,
                              qty: item.qty,
                              originalQty: item.qty,
                              minQty: 0,
                            })),
                          );
                          useOrderStore.getState().setViewOnly(true);
                          navigate(paths.orders.summary);
                        }}
                        className="text-(--color-primary)"
                      >
                        <Info size={20} />
                      </button>
                      {!isEndFilter && (
                        <>
                          <button
                            onClick={() => {
                              useOrderStore.getState().clearCart();
                              useOrderStore.getState().setTable(
                                o.tableId
                                  ? {
                                      id: o.tableId,
                                      name:
                                        o.tableSnapshot || `Bàn ${o.tableId}`,
                                    }
                                  : null,
                              );
                              useOrderStore.getState().setEditingOrder(o.id);
                              navigate(paths.orders.selectMenu);
                            }}
                            className="text-(--color-warning)"
                          >
                            <Edit3 size={20} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(o)}
                            className="text-(--color-danger)"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-2">
                    {(() => {
                      const grouped = groupItems(o.items);
                      return grouped.map((item, idx) => (
                        <div
                          key={item.name}
                          className={cn(
                            "flex justify-between items-center",
                            idx !== grouped.length - 1 &&
                              "mb-1 pb-1 border-b border-(--color-border-main) border-dashed",
                          )}
                        >
                          <div className="flex items-center">
                            <span className="text-(--color-text-main) min-w-10">
                              {item.qty}x
                            </span>
                            <span className="text-(--color-text-emphasis)">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="flex justify-between items-stretch border-t border-(--color-border-main) overflow-hidden h-10">
                    <div className="flex items-center gap-2 text-xs text-(--color-text-emphasis) px-4">
                      {formatTime(o.createdAt)}
                      <span className="text-(--color-text-muted)">•</span>
                      <div className="flex items-center justify-center gap-1">
                        <span>{itemCount} món</span>
                        <span>{portionCount} phần</span>
                      </div>
                    </div>

                    <div className="flex flex-1">
                      <button
                        disabled={isStartFilter}
                        onClick={() => revertOrder(o.id)}
                        className="flex-1 flex items-center justify-center gap-1 border-l border-(--color-border-subtle) text-(--color-primary) disabled:opacity-30"
                      >
                        <ArrowLeftFromLine size={14} />
                      </button>
                      <button
                        disabled={isEndFilter}
                        onClick={() => advanceOrder(o.id)}
                        className="flex-[1.5] flex items-center justify-center gap-1 border-l border-(--color-border-subtle) text-(--color-primary) disabled:opacity-30"
                      >
                        <ArrowRightFromLine size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={sentinelRef} className="h-4" />

            {isFetchingNextPage && (
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

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={`Xóa đơn #${formatId(deleteTarget?.id)}`}
        description="Hành động này sẽ xóa đơn và không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && deleteOrder(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
