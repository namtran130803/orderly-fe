import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { orderService } from "@/services/order.service";
import { formatMoney } from "@/utils/formatMoney";
import { groupItems } from "@/utils/groupItems";
import { formatId } from "@/utils/format";
import { useStoreStore } from "@/stores/store.store";
import { useOrderStore } from "@/stores/order.store";

type GroupedItem = {
  id: number;
  name: string;
  qty: number;
  priceSnapshot: number;
  statusSnapshot: string;
  statusId: number;
};

export const OrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const table = useOrderStore((s) => s.table);
  const editingOrderId = useOrderStore((s) => s.editingOrderId);
  const cart = useOrderStore((s) => s.cart);
  const clearOrder = useOrderStore((s) => s.clearOrder);

  const isEditing = !!editingOrderId;
  const viewOnly = useOrderStore((s) => s.viewOnly);

  const { data: orderDetail } = useQuery({
    queryKey: ["order-detail", storeId, editingOrderId],
    queryFn: async () => {
      const res = await orderService.detail(storeId!, editingOrderId!);
      return res.data.data;
    },
    enabled: !!storeId && isEditing,
  });

  const existingItems = orderDetail?.items || [];

  useEffect(() => {
    if (cart.length === 0) {
      if (viewOnly || !isEditing) {
        navigate(paths.orders.index, { replace: true });
      }
    }
  }, [cart, navigate, viewOnly, isEditing]);

  const viewOnlyItems: GroupedItem[] = groupItems(existingItems).sort(
    (a: GroupedItem, b: GroupedItem) => {
      if (a.statusId !== b.statusId) return a.statusId - b.statusId;
      return (a.name || "").localeCompare(b.name || "");
    },
  );

  const oldItems: GroupedItem[] =
    existingItems.length > 0
      ? groupItems(
          existingItems.filter((ei: any) =>
            cart.some(
              (ci) =>
                ci.menuItemId === ei.menuItemId || ci.name === ei.nameSnapshot,
            ),
          ),
        ).sort((a: GroupedItem, b: GroupedItem) => {
          if (a.statusId !== b.statusId) return a.statusId - b.statusId;
          return (a.name || "").localeCompare(b.name || "");
        })
      : [];

  const newItems: { name: string; price: number; qty: number }[] = [];
  cart.forEach((ci) => {
    if (ci.originalQty > 0 && ci.qty > ci.originalQty) {
      newItems.push({
        name: ci.name,
        price: ci.price,
        qty: ci.qty - ci.originalQty,
      });
    }
    if (ci.originalQty === 0 && ci.qty > 0) {
      newItems.push({ name: ci.name, price: ci.price, qty: ci.qty });
    }
  });

  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: () => {
      const items = cart
        .filter((item) => item.menuItemId !== null)
        .map((item) => ({
          menuItemId: item.menuItemId as number,
          qty: item.qty >= 0 ? item.qty : 0,
        }));

      if (isEditing) {
        return orderService.update(storeId!, editingOrderId, { items });
      }
      return orderService.create(storeId!, {
        tableName: table?.name || null,
        items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", storeId] });
      queryClient.invalidateQueries({ queryKey: ["tables", storeId] });
      toast.success(
        isEditing ? "Cập nhật đơn hàng thành công" : "Tạo đơn hàng thành công",
      );
      clearOrder();
      navigate(paths.orders.index, { replace: true });
    },
  });

  const viewOnlyTotal = viewOnlyItems.reduce(
    (sum, i) => sum + i.priceSnapshot * i.qty,
    0,
  );
  const viewOnlyNameCount = new Set(viewOnlyItems.map((i) => i.name)).size;
  const viewOnlyPortionCount = viewOnlyItems.reduce((sum, i) => sum + i.qty, 0);

  const oldTotal = oldItems.reduce(
    (sum, i) => sum + i.priceSnapshot * i.qty,
    0,
  );
  const newTotal = newItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const grandTotal = viewOnly ? viewOnlyTotal : oldTotal + newTotal;

  const oldNameCount = new Set(oldItems.map((i) => i.name)).size;
  const oldPortionCount = oldItems.reduce((sum, i) => sum + i.qty, 0);
  const newNameCount = new Set(newItems.map((i) => i.name)).size;
  const newPortionCount = newItems.reduce((sum, i) => sum + i.qty, 0);
  const allNameCount = new Set([
    ...oldItems.map((i) => i.name),
    ...newItems.map((i) => i.name),
  ]).size;
  const totalPortionCount = oldPortionCount + newPortionCount;

  const createdAt = orderDetail?.createdAt
    ? new Date(orderDetail.createdAt).toLocaleString("vi-VN")
    : new Date().toLocaleString("vi-VN");

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <div className="bg-(--color-bg-surface) h-15 px-4 flex items-center gap-2 border-b border-(--color-border-main)">
        <button onClick={() => navigate(-1)} className="text-(--color-primary)">
          <ChevronLeft size={24} />
        </button>
        <div className="text-(--color-primary)">
          <CheckCircle2 size={24} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-(--color-text-main) truncate capitalize">
            {viewOnly ? "Chi tiết đơn" : isEditing ? "Sửa đơn" : "Tạo đơn"}
          </h2>
          <p className="text-xs text-(--color-text-secondary) truncate">
            {table?.name || "Mang về"}
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">
              Thông tin chung
            </div>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">Thời gian</div>
                {createdAt}
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">Mã đơn</div>
                <span>
                  {orderDetail?.id ? `#${formatId(orderDetail.id)}` : "—"}
                </span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">Bàn</div>
                <span>{table?.name || "Mang về"}</span>
              </div>
            </div>

            {viewOnly ? (
              <OrderItemsSection
                title="Danh sách món"
                nameCount={viewOnlyNameCount}
                portionCount={viewOnlyPortionCount}
                items={viewOnlyItems.map((i) => ({
                  key: String(i.id),
                  qty: i.qty,
                  name: i.name,
                  subtitle: i.statusSnapshot,
                  total: i.priceSnapshot * i.qty,
                }))}
              />
            ) : (
              <>
                <OrderItemsSection
                  title={isEditing ? "Món thêm mới" : "Danh sách món"}
                  nameCount={newNameCount}
                  portionCount={newPortionCount}
                  items={newItems.map((i) => ({
                    key: i.name,
                    qty: i.qty,
                    name: i.name,
                    subtitle: undefined,
                    total: i.price * i.qty,
                  }))}
                />

                {isEditing && oldItems.length > 0 && (
                  <OrderItemsSection
                    title="Món đang phục vụ"
                    nameCount={oldNameCount}
                    portionCount={oldPortionCount}
                    items={oldItems.map((i) => ({
                      key: String(i.id),
                      qty: i.qty,
                      name: i.name,
                      subtitle: i.statusSnapshot,
                      total: i.priceSnapshot * i.qty,
                    }))}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-(--color-bg-surface) border-t border-(--color-border-main)">
        {isEditing && !viewOnly && (
          <>
            <div className="px-4 py-2 flex justify-between items-center text-sm">
              <span className="text-(--color-text-secondary)">
                Món thêm mới
              </span>
              <span className="text-(--color-text-secondary) tabular-nums">
                {formatMoney(newTotal)}
              </span>
            </div>
            <div className="px-4 py-2 flex justify-between items-center text-sm">
              <span className="text-(--color-text-secondary)">
                Món đang phục vụ
              </span>
              <span className="text-(--color-text-secondary) tabular-nums">
                {formatMoney(oldTotal)}
              </span>
            </div>
          </>
        )}
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-(--color-text-main) text-xl">
              Tổng cộng
            </span>
            <span className="text-(--color-text-secondary)">
              {viewOnly
                ? `${viewOnlyNameCount} món, ${viewOnlyPortionCount} phần`
                : `${allNameCount} món, ${totalPortionCount} phần`}
            </span>
          </div>
          <span className="text-2xl font-bold text-(--color-success) tabular-nums shrink-0">
            {formatMoney(grandTotal)}
          </span>
        </div>
        {!viewOnly && (
          <button
            onClick={() => submitOrder()}
            disabled={isPending}
            className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg disabled:opacity-50"
          >
            {isEditing ? "Cập nhật" : "Xác nhận"}
          </button>
        )}
      </div>
    </div>
  );
};

type OrderItem = {
  key: string;
  qty: number;
  name: string;
  subtitle: string | undefined;
  total: number;
};

const OrderItemsSection: React.FC<{
  title: string;
  nameCount: number;
  portionCount: number;
  items: OrderItem[];
}> = ({ title, nameCount, portionCount, items }) => {
  if (items.length === 0) return null;
  return (
    <>
      <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">
        {title}
        <span className="ml-2 text-sm font-normal">
          ({nameCount} món, {portionCount} phần)
        </span>
      </div>
      <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
        {items.map((item, index) => (
          <div
            key={index}
            className="px-4 py-3 flex justify-between items-center"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-(--color-text-secondary)">
                  {item.qty}x
                </span>
                <span className="text-(--color-text-main) truncate">
                  {item.name}
                </span>
              </div>
              {item.subtitle && (
                <span className="text-[11px] text-(--color-text-secondary)">
                  {item.subtitle}
                </span>
              )}
            </div>
            <span className="text-(--color-text-secondary) tabular-nums shrink-0">
              {formatMoney(item.total)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
