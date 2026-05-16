import { create } from "zustand";

export type CartItem = {
  menuItemId: number | null;
  name: string;
  price: number;
  qty: number;
  originalQty: number;
  minQty: number;
};

type OrderState = {
  table: { id: number; name: string } | null | undefined;
  editingOrderId: number | null;
  cart: CartItem[];
  viewOnly: boolean;

  setTable: (table: { id: number; name: string } | null) => void;
  setEditingOrder: (orderId: number | null) => void;
  setCart: (items: CartItem[]) => void;
  addToCart: (
    item: { menuItemId: number | null; name: string; price: number },
    qty?: number,
  ) => void;
  updateQty: (menuItemId: number | null, qty: number) => void;
  clearCart: () => void;
  setViewOnly: (v: boolean) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<OrderState>()((set) => ({
  table: undefined,
  editingOrderId: null,
  cart: [],
  viewOnly: false,

  setTable: (table) => set({ table }),

  setEditingOrder: (orderId) => set({ editingOrderId: orderId }),

  setCart: (items) => set({ cart: items }),

  setViewOnly: (v) => set({ viewOnly: v }),

  addToCart: (item, qty = 1) =>
    set((state) => {
      const existing = state.cart.find(
        (i) => i.menuItemId === item.menuItemId,
      );
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.menuItemId === item.menuItemId ? { ...i, qty: i.qty + qty } : i,
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          { ...item, qty, originalQty: 0, minQty: 0 },
        ],
      };
    }),

  updateQty: (menuItemId, qty) =>
    set((state) => {
      const item = state.cart.find((i) => i.menuItemId === menuItemId);
      if (!item) return state;
      const clamped = Math.max(item.minQty, qty);
      if (clamped <= 0 && item.originalQty <= 0) {
        return {
          cart: state.cart.filter((i) => i.menuItemId !== menuItemId),
        };
      }
      return {
        cart: state.cart.map((i) =>
          i.menuItemId === menuItemId ? { ...i, qty: clamped } : i,
        ),
      };
    }),

  clearCart: () => set({ cart: [] }),
  clearOrder: () =>
    set({
      table: undefined,
      editingOrderId: null,
      cart: [],
      viewOnly: false,
    }),
}));
