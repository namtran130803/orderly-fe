import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Minus, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { paths } from "@/config/paths";
import { useSwipeTabs } from "@/hooks/useSwipeTabs";
import { cn } from "@/lib/cn";
import { categoryService } from "@/services/category.service";
import { menuItemService, type MenuItem } from "@/services/menu-item.service";
import { orderService } from "@/services/order.service";
import {
  statusService,
  STATUS_TYPE,
  type Status,
} from "@/services/status.service";
import { formatMoney } from "@/utils/formatMoney";
import { useStoreStore } from "@/stores/store.store";
import { useOrderStore } from "@/stores/order.store";

export const SelectMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const storeId = useStoreStore((s) => s.store?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId") || "all";

  const table = useOrderStore((s) => s.table);
  const editingOrderId = useOrderStore((s) => s.editingOrderId);
  const cart = useOrderStore((s) => s.cart);
  const setCart = useOrderStore((s) => s.setCart);
  const addToCart = useOrderStore((s) => s.addToCart);
  const updateQty = useOrderStore((s) => s.updateQty);

  useEffect(() => {
    if (table === undefined) {
      navigate(paths.orders.index, { replace: true });
    }
  }, [table, navigate]);

  // Fetch existing order detail
  const { data: orderDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["order-detail", storeId, editingOrderId],
    queryFn: async () => {
      const res = await orderService.detail(storeId!, editingOrderId!);
      return res.data.data;
    },
    enabled: !!storeId && !!editingOrderId,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const res = await categoryService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu-items", storeId],
    queryFn: async () => {
      const res = await menuItemService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["statuses", storeId],
    queryFn: async () => {
      const res = await statusService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const startStatusId = editingOrderId
    ? statuses.find((s: Status) => s.type === STATUS_TYPE.START)?.id
    : null;

  // Populate cart from order detail only on first load (cart is empty)
  useEffect(() => {
    if (orderDetail && startStatusId && cart.length === 0) {
      const grouped = orderDetail.items.reduce((acc: any, item) => {
        const key = item.menuItemId ?? item.nameSnapshot;
        if (!acc[key]) {
          acc[key] = {
            menuItemId: item.menuItemId,
            name: item.nameSnapshot,
            price: item.priceSnapshot,
            qty: 0,
            nonStartQty: 0,
          };
        }
        acc[key].qty += item.qty;
        if (item.statusId !== startStatusId) {
          acc[key].nonStartQty += item.qty;
        }
        return acc;
      }, {});
      const cartItems = Object.values(grouped).map((g: any) => ({
        menuItemId: g.menuItemId,
        name: g.name,
        price: g.price,
        qty: g.qty,
        originalQty: g.qty,
        minQty: g.nonStartQty,
      }));
      setCart(cartItems);
    }
  }, [orderDetail, startStatusId, setCart]);

  const setCategoryId = (id: number | "all") => {
    setSearchParams({ categoryId: String(id) }, { replace: true });
  };

  const hasMultipleCategories = categories.length > 1;
  const currentTabId: number | "all" = categoryIdParam === "all" ? "all" : Number(categoryIdParam);
  const tabItems = [{ id: "all" as const }, ...categories];
  const swipeHandlers = useSwipeTabs({
    items: tabItems,
    currentId: currentTabId,
    setCurrentId: setCategoryId,
    enabled: hasMultipleCategories,
  });
  const filteredMenu =
    categoryIdParam === "all" || !hasMultipleCategories
      ? menuItems
      : menuItems.filter((m) => m.categoryId === Number(categoryIdParam));

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
    if (categoryIdParam) {
      scrollTabIntoView(`cat-tab-${categoryIdParam}`);
    }
  }, [categoryIdParam]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartUniqueItems = cart.filter((i) => i.qty > 0).length;

  const handleCartChange = (item: MenuItem, delta: number) => {
    const cartItem = cart.find((i) => i.menuItemId === item.id);
    if (!cartItem) {
      if (delta > 0)
        addToCart(
          { menuItemId: item.id, name: item.name, price: item.price },
          delta,
        );
      return;
    }
    const newQty = Math.max(0, cartItem.qty + delta);
    if (newQty === cartItem.qty) return;
    updateQty(item.id, newQty);
  };

  const isLoading = isCategoriesLoading || isMenuLoading || isDetailLoading;

  return (
    <div className="flex-1 flex flex-col relative">
      {isLoading && <LoadingOverlay />}
      <Header
        title="Chọn món"
        subtitle={table?.name || "Mang về"}
        Icon={BookOpen}
        backUrl={
          editingOrderId ? paths.orders.index : paths.orders.selectTable
        }
      />

      {hasMultipleCategories && (
        <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto shrink-0">
          <button
            id="cat-tab-all"
            onClick={() => setCategoryId("all")}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 flex items-center gap-2",
              categoryIdParam === "all" &&
                "border-(--color-primary) text-(--color-primary)",
              categoryIdParam !== "all" &&
                "border-transparent text-(--color-text-secondary)",
            )}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              id={`cat-tab-${c.id}`}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2",
                categoryIdParam === String(c.id) &&
                  "border-(--color-primary) text-(--color-primary)",
                categoryIdParam !== String(c.id) &&
                  "border-transparent text-(--color-text-secondary)",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative" {...swipeHandlers}>
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {filteredMenu.map((item) => {
                const qty =
                  cart.find((i) => i.menuItemId === item.id)?.qty || 0;
                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-(--color-text-main) truncate">
                        {item.name}
                      </p>
                      <p className="text-(--color-text-secondary) mt-0.5 tabular-nums">
                        {formatMoney(item.price)}
                      </p>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleCartChange(item, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-(--color-bg-main) text-(--color-primary)"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button
                          disabled={
                            qty <=
                            (cart.find((i) => i.menuItemId === item.id)
                              ?.minQty || 0)
                          }
                          onClick={() => handleCartChange(item, -1)}
                          className="w-8 h-8 bg-(--color-bg-main) flex items-center justify-center text-(--color-primary) disabled:opacity-30"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-semibold w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleCartChange(item, 1)}
                          className="w-8 h-8 bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {cartItemCount > 0 && (
        <div className="bg-(--color-bg-surface) border-t border-(--color-border-main)">
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-(--color-text-secondary)">
              {cartUniqueItems} món, {cartItemCount} phần
            </span>
            <span className="font-bold text-(--color-text-main) font-money">
              {formatMoney(cartTotal)}
            </span>
          </div>
          <button
            onClick={() => navigate(paths.orders.summary)}
            className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  );
};
