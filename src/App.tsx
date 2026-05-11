import React, { useState, useMemo, useEffect } from 'react';
import {
  Store as StoreIcon, PackageSearch, Settings, Plus, ChevronLeft,
  CheckCircle2, Clock, ChevronRight, Phone, Lock, User,
  Trash2, Minus, ShoppingCart, Pencil,
  LogOut, FileText, Check,
  Edit3, Grid, Layers, Utensils, BarChart3, Trophy,
  ArrowRightFromLine, Info, BookOpen, Activity,
  ArrowLeftFromLine, ChevronUp, ChevronDown
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
export type Route = 'auth' | 'app' | 'create_store';
export type AuthMode = 'login' | 'register';
export type ActiveTab = 'dashboard' | 'orders' | 'imports' | 'settings';
export type SubView = 'main' | 'settings_stores' | 'settings_menu' | 'settings_tables' | 'settings_statuses';
export type StatusType = 'start' | 'mid' | 'end';
export type ModalType = 'category' | 'menu_item' | 'area' | 'status' | 'invoice' | null;

export interface Store {
  id: string;
  name: string;
  address: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface Area {
  id: string;
  name: string;
  tableCount: number;
}

export interface Table {
  id: string;
  name: string;
  areaId: string;
  areaName?: string;
}

export interface Status {
  id: string;
  name: string;
  type: StatusType;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  status: string;
  originalItems?: OrderItem[];
}

export interface Order {
  id: number;
  tableId: string | null;
  tableName: string;
  status: string;
  time: string;
  total: number;
  items: OrderItem[];
}

export interface Invoice {
  id: string;
  supplier: string;
  date: string;
  total: number;
}

export interface UserProfile {
  name: string;
  phone: string;
}

export interface AuthForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: any;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

// ==========================================
// THIẾT LẬP THEME (FLAT UI - NATIVE MOBILE)
// ==========================================
const ThemeStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    :root {
      /* Core Colors */
      --color-primary: #007AFF;
      --color-primary-light: #E5F0FF;
      --color-primary-dark: #0063CC;
      
      --color-success: #34C759;
      --color-success-dark: #248A3D;
      --color-success-light: #EBFBEE;
      
      --color-danger: #FF3B30;
      --color-danger-light: #FFEBEE;
      
      --color-warning: #FF9500;
      --color-warning-dark: #CC7600;
      --color-warning-light: #FFF4E5;
      
      --color-info: #5856D6;
      --color-info-light: #F2F2FF;
      
      /* Backgrounds & Surfaces */
      --color-bg-main: #F2F2F7;
      --color-bg-surface: #FFFFFF;
      --color-bg-subtle: #F2F2F7;
      --color-bg-active: #F9FAFB;
      
      /* Borders */
      --color-border-main: #E5E5EA;
      --color-border-subtle: #F2F2F7;
      
      /* Text */
      --color-text-main: #000000;
      --color-text-emphasis: #3A3A3C;
      --color-text-secondary: #8E8E93;
      --color-text-tertiary: #636366;
      --color-text-muted: #C7C7CC;
      --color-text-placeholder: #D1D1D6;
    }
    
    .font-money {
      font-family: 'SF Mono', SFMono-Regular, ui-monospace, 'DejaVu Sans Mono', 'Roboto Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    
    /* Smooth scrolling & hide scrollbar */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}} />
);

// ==========================================
// MOCK DATA
// ==========================================
const INITIAL_STORES: Store[] = [
  { id: 's1', name: 'Orderly Cafe - Quận 1', address: '123 Lê Lợi, Q.1, TP.HCM' },
  { id: 's2', name: 'Orderly Cafe - Quận 3', address: '45 Võ Văn Tần, Q.3, TP.HCM' },
  { id: 's3', name: 'Orderly Cafe - Tân Bình', address: '89 Cộng Hòa, Tân Bình, TP.HCM' }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Cà phê' },
  { id: 'c2', name: 'Trà trái cây' },
  { id: 'c3', name: 'Đồ ăn vặt' },
  { id: 'c4', name: 'Bánh ngọt' }
];

const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', name: 'Cà phê sữa đá', price: 25000, categoryId: 'c1' },
  { id: 'm2', name: 'Bạc xỉu', price: 29000, categoryId: 'c1' },
  { id: 'm3', name: 'Americano', price: 35000, categoryId: 'c1' },
  { id: 'm4', name: 'Trà đào cam sả', price: 35000, categoryId: 'c2' },
  { id: 'm5', name: 'Trà vải nhiệt đới', price: 38000, categoryId: 'c2' },
  { id: 'm6', name: 'Trà ô long hạt sen', price: 40000, categoryId: 'c2' },
  { id: 'm7', name: 'Hướng dương', price: 15000, categoryId: 'c3' },
  { id: 'm8', name: 'Khô gà lá chanh', price: 25000, categoryId: 'c3' },
  { id: 'm9', name: 'Bánh Tiramisu', price: 45000, categoryId: 'c4' },
  { id: 'm10', name: 'Bánh Croissant', price: 30000, categoryId: 'c4' }
];

const INITIAL_AREAS: Area[] = [
  { id: 'a1', name: 'Tầng 1', tableCount: 6 },
  { id: 'a2', name: 'Tầng 2', tableCount: 8 },
  { id: 'a3', name: 'Sân vườn', tableCount: 5 }
];

const generateTablesFromAreas = (areasList: Area[]): Table[] => {
  let tables: Table[] = [];
  areasList.forEach(area => {
    for (let i = 1; i <= area.tableCount; i++) {
      tables.push({ id: `t_${area.id}_${i}`, name: `Bàn ${i}`, areaId: area.id });
    }
  });
  return tables;
};

const INITIAL_STATUSES: Status[] = [
  { id: 'st1', name: 'Chờ xử lý', type: 'start' },
  { id: 'st2', name: 'Đang chuẩn bị', type: 'mid' },
  { id: 'st3', name: 'Hoàn thành', type: 'end' },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1, tableId: 't_a1_1', tableName: 'Tầng 1 - Bàn 1', status: 'Hoàn thành', time: '08:15', total: 54000,
    items: [{ id: 'm1', name: 'Cà phê sữa đá', price: 25000, qty: 1, status: 'Hoàn thành' }, { id: 'm2', name: 'Bạc xỉu', price: 29000, qty: 1, status: 'Hoàn thành' }]
  },
  {
    id: 2, tableId: 't_a1_2', tableName: 'Tầng 1 - Bàn 2', status: 'Đang chuẩn bị', time: '09:30', total: 70000,
    items: [{ id: 'm4', name: 'Trà đào cam sả', price: 35000, qty: 2, status: 'Đang chuẩn bị' }]
  },
  {
    id: 3, tableId: null, tableName: 'Mang về', status: 'Chờ xử lý', time: '10:05', total: 45000,
    items: [{ id: 'm10', name: 'Bánh Croissant', price: 30000, qty: 1, status: 'Chờ xử lý' }, { id: 'm7', name: 'Hướng dương', price: 15000, qty: 1, status: 'Chờ xử lý' }]
  }
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-1', supplier: 'Nhập nguyên liệu đầu tuần', date: new Date().toLocaleDateString('vi-VN'), total: 200000 },
  { id: 'INV-2', supplier: 'Thanh toán tiền điện', date: new Date().toLocaleDateString('vi-VN'), total: 1200000 }
];

const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
const formatId = (num: number) => num.toString().padStart(3, '0').slice(-3);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function OrderlyApp() {
  const [route, setRoute] = useState<Route>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [authForm, setAuthForm] = useState<AuthForm>({ name: '', phone: '0901234567', password: 'password123', confirmPassword: '' });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [tables, setTables] = useState<Table[]>(generateTablesFromAreas(INITIAL_AREAS));
  const [statuses, setStatuses] = useState<Status[]>(INITIAL_STATUSES);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [orderIdCounter, setOrderIdCounter] = useState<number>(4);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [subView, setSubView] = useState<SubView>('main');
  const [orderFilter, setOrderFilter] = useState<string>(INITIAL_STATUSES[0].name);
  const [dashboardPeriod] = useState<string>('today');
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null, data: null });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ isOpen: true, title: '', message: '', onConfirm: () => { } });
  // Set isOpen to false immediately after initialization to avoid flash
  useEffect(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const [showQuickOrder, setShowQuickOrder] = useState<boolean>(false);
  const [showTableSelector, setShowTableSelector] = useState<boolean>(false);
  const [showOrderSummary, setShowOrderSummary] = useState<boolean>(false);
  const [qoTable, setQoTable] = useState<Table | null>(null);
  const [qoCategoryFilter, setQoCategoryFilter] = useState<string>('all');
  const [qoAreaFilter, setQoAreaFilter] = useState<string>(areas.length > 0 ? areas[0].id : '');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [isReadOnlySummary, setIsReadOnlySummary] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    setCurrentUser({ name: authForm.name || 'Trần Trọng Nam', phone: authForm.phone });

    if (stores.length === 0) {
      setRoute('create_store');
    } else {
      setSelectedStore(stores[0]);
      setRoute('app');
      setActiveTab('dashboard');
    }
  };

  // ORDER LOGICS
  const startNewOrder = () => {
    setEditingOrderId(null);
    setCart([]);
    setIsReadOnlySummary(false);
    setShowTableSelector(true);
  };

  const editOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setIsReadOnlySummary(false);

    if (order.tableId) {
      const tableObj = tables.find(t => t.id === order.tableId);
      if (tableObj) {
        const areaObj = areas.find(a => a.id === tableObj.areaId);
        setQoTable({ ...tableObj, areaName: areaObj?.name || '' });
      } else {
        setQoTable(null);
      }
    } else {
      setQoTable(null);
    }

    const cartItems: OrderItem[] = [];
    order.items.forEach(item => {
      if (item.qty <= 0) return;
      const existing = cartItems.find(i => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
        existing.originalItems = existing.originalItems || [];
        existing.originalItems.push({ ...item });
      } else {
        cartItems.push({
          ...item,
          originalItems: [{ ...item }]
        });
      }
    });
    setCart(cartItems);
    setShowQuickOrder(true);
  };

  const viewOrderSummary = (order: Order) => {
    setEditingOrderId(order.id);

    if (order.tableId) {
      const tableObj = tables.find(t => t.id === order.tableId);
      if (tableObj) {
        const areaObj = areas.find(a => a.id === tableObj.areaId);
        setQoTable({ ...tableObj, areaName: areaObj?.name || '' });
      } else {
        setQoTable(null);
      }
    } else {
      setQoTable(null);
    }

    const cartItems: OrderItem[] = [];
    order.items.forEach(item => {
      if (item.qty <= 0) return;
      cartItems.push({
        ...item,
        originalItems: [{ ...item }]
      });
    });
    setCart(cartItems);
    setIsReadOnlySummary(true);
    setShowOrderSummary(true);
  };

  const saveOrder = () => {
    const startStatus = statuses.find(s => s.type === 'start')?.name || statuses[0].name;
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (editingOrderId) {
      setOrders(prev => prev.map(o => {
        if (o.id === editingOrderId) {
          const newOrderItems: OrderItem[] = [];

          cart.forEach(cartItem => {
            if (cartItem.qty === 0) return;
            let remainingQty = cartItem.qty;

            if (cartItem.originalItems) {
              for (const orig of cartItem.originalItems) {
                if (remainingQty <= 0) break;
                const take = Math.min(orig.qty, remainingQty);
                newOrderItems.push({ ...orig, qty: take });
                remainingQty -= take;
              }
            }

            if (remainingQty > 0) {
              newOrderItems.push({
                id: cartItem.id,
                name: cartItem.name,
                price: cartItem.price,
                qty: remainingQty,
                status: startStatus
              });
            }
          });

          let mergedItems: OrderItem[] = [];
          newOrderItems.forEach(newItem => {
            const existingIndex = mergedItems.findIndex(i => i.name === newItem.name && i.status === newItem.status);
            if (existingIndex >= 0) {
              mergedItems[existingIndex].qty += newItem.qty;
            } else {
              mergedItems.push({ ...newItem });
            }
          });

          const lowestStatusIndex = Math.min(...mergedItems.filter(i => i.qty > 0).map(item => statuses.findIndex(s => s.name === item.status)));
          const finalOrderStatus = statuses[lowestStatusIndex >= 0 ? lowestStatusIndex : 0]?.name || startStatus;

          return {
            ...o,
            status: finalOrderStatus,
            total: mergedItems.reduce((sum, i) => sum + (i.price * i.qty), 0),
            items: mergedItems
          };
        }
        return o;
      }));
    } else {
      const newOrder = {
        id: orderIdCounter,
        tableId: qoTable ? qoTable.id : null,
        tableName: qoTable ? `${qoTable.areaName} - ${qoTable.name}` : 'Mang về',
        status: startStatus,
        time: timeString,
        items: cart.filter(i => i.qty > 0).map(i => ({ ...i, status: startStatus })),
        total: cart.reduce((sum, i) => sum + (i.price * i.qty), 0)
      };
      setOrders([newOrder, ...orders]);
      setOrderIdCounter(prev => prev + 1);
    }

    setShowOrderSummary(false);
    setShowQuickOrder(false);
    setShowTableSelector(false);
    setCart([]);
    setEditingOrderId(null);
  };

  const moveOrderStatus = (orderId: number, direction: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = statuses.findIndex(s => s.name === orderFilter);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const newStatus = statuses[nextIndex];
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          let updatedItems = o.items.map(i => {
            if (i.status === orderFilter) {
              return { ...i, status: newStatus.name };
            }
            return i;
          });

          let mergedItems: OrderItem[] = [];
          updatedItems.forEach(item => {
            const existingIndex = mergedItems.findIndex(i => i.name === item.name && i.status === item.status);
            if (existingIndex >= 0) {
              mergedItems[existingIndex] = {
                ...mergedItems[existingIndex],
                qty: mergedItems[existingIndex].qty + item.qty
              };
            } else {
              mergedItems.push({ ...item });
            }
          });

          const lowestStatusIndex = Math.min(...mergedItems.filter(i => i.qty > 0).map(item => statuses.findIndex(s => s.name === item.status)));
          const finalOrderStatus = statuses[lowestStatusIndex >= 0 ? lowestStatusIndex : 0]?.name || newStatus.name;

          return {
            ...o,
            status: finalOrderStatus,
            items: mergedItems
          };
        }
        return o;
      }));
    }
  };

  const getTableStatus = (tableId: string) => {
    const activeOrder = orders.find(o => o.tableId === tableId && o.items.some(i => i.qty > 0 && statuses.findIndex(s => s.name === i.status) < statuses.length - 1));
    return activeOrder ? 'serving' : 'empty';
  };

  const deleteOrder = (orderId: number) => {
    openConfirm(`Xóa đơn #${formatId(orderId)}?`, 'Hành động này không thể hoàn tác.', () => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    });
  };

  // DASHBOARD STATS
  const stats = useMemo(() => {
    const endStatus = statuses.find(s => s.type === 'end')?.name;
    const completedOrders = orders.filter(o => o.status === endStatus);
    const mult = 1;

    const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0) * mult;
    const expense = invoices.reduce((sum, inv) => sum + inv.total, 0) * mult;
    const orderCount = completedOrders.length * mult;

    const itemCounts: Record<string, number> = {};
    completedOrders.forEach(o => o.items.forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + (i.qty * mult);
    }));

    const topItems = Object.entries(itemCounts).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 3);
    const totalItemsSold = Object.values(itemCounts).reduce((a, b) => a + b, 0);

    return { revenue, expense, orderCount, topItems, totalItemsSold };
  }, [orders, invoices, dashboardPeriod, statuses]);

  const orderSummarySplit = useMemo(() => {
    const newItems: OrderItem[] = [];
    const oldItems: OrderItem[] = [];

    cart.forEach(cartItem => {
      if (cartItem.qty <= 0) return;
      let remainingQty = cartItem.qty;

      if (cartItem.originalItems) {
        cartItem.originalItems.forEach(orig => {
          if (remainingQty <= 0) return;
          const take = Math.min(orig.qty, remainingQty);
          oldItems.push({ ...orig, qty: take });
          remainingQty -= take;
        });
      }

      if (remainingQty > 0) {
        newItems.push({
          ...cartItem,
          qty: remainingQty,
          status: statuses.find(s => s.type === 'start')?.name || statuses[0].name
        });
      }
    });

    const group = (arr: OrderItem[], keyFn: (item: OrderItem) => string) => arr.reduce((acc: OrderItem[], item: OrderItem) => {
      const key = keyFn(item);
      const existing = acc.find(i => keyFn(i) === key);
      if (existing) existing.qty += item.qty;
      else acc.push({ ...JSON.parse(JSON.stringify(item)) });
      return acc;
    }, []);

    const groupedNew = group(newItems, i => i.name);
    const groupedOld = group(oldItems, i => `${i.name}-${i.status}`);
    const groupedFlat = group([...newItems, ...oldItems], i => i.name);

    const newTotal = groupedNew.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const oldTotal = groupedOld.reduce((sum, i) => sum + (i.price * i.qty), 0);

    return { new: groupedNew, old: groupedOld, flat: groupedFlat, newTotal, oldTotal };
  }, [cart, statuses]);

  // SWIPE LOGIC
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleSwipe = (dx: number, dy: number, context: 'orders' | 'tables' | 'menu') => {
    if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 50) {
      if (context === 'orders') {
        const currentIndex = statuses.findIndex(s => s.name === orderFilter);
        if (dx < 0 && currentIndex < statuses.length - 1) {
          const next = statuses[currentIndex + 1].name;
          setOrderFilter(next);
          scrollTabIntoView(`status-tab-${next}`);
        }
        else if (dx > 0 && currentIndex > 0) {
          const prev = statuses[currentIndex - 1].name;
          setOrderFilter(prev);
          scrollTabIntoView(`status-tab-${prev}`);
        }
      } else if (context === 'tables') {
        const currentIndex = areas.findIndex(a => a.id === qoAreaFilter);
        if (dx < 0 && currentIndex < areas.length - 1) {
          const next = areas[currentIndex + 1].id;
          setQoAreaFilter(next);
          scrollTabIntoView(`area-tab-${next}`);
        }
        else if (dx > 0 && currentIndex > 0) {
          const prev = areas[currentIndex - 1].id;
          setQoAreaFilter(prev);
          scrollTabIntoView(`area-tab-${prev}`);
        }
      } else if (context === 'menu') {
        const cats = [{ id: 'all', name: 'Tất cả' }, ...categories];
        const currentIndex = cats.findIndex(c => c.id === qoCategoryFilter);
        if (dx < 0 && currentIndex < cats.length - 1) {
          const next = cats[currentIndex + 1].id;
          setQoCategoryFilter(next);
          scrollTabIntoView(`cat-tab-${next}`);
        }
        else if (dx > 0 && currentIndex > 0) {
          const prev = cats[currentIndex - 1].id;
          setQoCategoryFilter(prev);
          scrollTabIntoView(`cat-tab-${prev}`);
        }
      }
    }
  };

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, 50);
  };

  const createSwipeHandler = (context: 'orders' | 'tables' | 'menu') => (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    handleSwipe(dx, dy, context);
    setTouchStart(null);
  };

  // ==========================================
  // UI COMPONENTS (FLAT DESIGN)
  // ==========================================
  const renderHeader = (title: string | undefined, leftIcon: React.ReactNode, onLeftClick: (() => void) | null, rightAction: React.ReactNode, icon: React.ReactNode, subtitle?: string) => (
    <div className="bg-(--color-bg-surface) h-[60px] px-4 flex items-center justify-between shrink-0 z-10 border-b border-(--color-border-main) sticky top-0">
      <div className="flex items-center gap-3 overflow-hidden">
        {leftIcon && (
          <button onClick={onLeftClick || undefined} className="p-2 -ml-2 active:opacity-50 transition-opacity text-(--color-primary) shrink-0">
            {leftIcon}
          </button>
        )}
        {icon && <div className="text-(--color-primary) shrink-0">{icon}</div>}
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-bold text-(--color-text-main) truncate">{title}</h2>
          {subtitle && <p className="text-xs text-(--color-text-secondary) truncate">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );

  // --- QUICK ORDER & TABLE SELECTOR ---
  const renderTableSelector = () => {
    if (!showTableSelector) return null;
    const hasMultipleAreas = areas.length > 1;
    const currentArea = areas.find(a => a.id === qoAreaFilter) || areas[0];
    const filteredTables = tables.filter(t => t.areaId === currentArea?.id).map(t => ({ ...t, areaName: currentArea?.name }));

    return (
      <div
        className="absolute inset-0 bg-(--color-bg-main) z-90 flex flex-col animate-in slide-in-from-bottom"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeHandler('tables')}
      >
        {renderHeader('Chọn bàn', <ChevronLeft size={24} />, () => setShowTableSelector(false), null, <Grid size={20} />)}

        {hasMultipleAreas && (
          <div className="bg-(--color-bg-surface) flex px-2 border-b border-(--color-border-main) overflow-x-auto no-scrollbar shrink-0">
            {areas.map(area => (
              <button key={area.id} id={`area-tab-${area.id}`} onClick={() => setQoAreaFilter(area.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${qoAreaFilter === area.id ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-text-secondary)'}`}>
                {area.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main)">
            <button onClick={() => {
              setEditingOrderId(null);
              setQoTable(null);
              setShowTableSelector(false);
              setCart([]);
              setShowQuickOrder(true);
            }}
              className="w-full flex items-center justify-between px-4 py-3 active:bg-(--color-bg-subtle) transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center"><PackageSearch size={18} /></div>
                <span className="text-base text-(--color-text-main)">Mang về</span>
              </div>
              <ChevronRight size={20} className="text-(--color-text-placeholder)" />
            </button>
          </div>

          <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
            {filteredTables.map(t => {
              const status = getTableStatus(t.id);
              const isServing = status === 'serving';
              return (
                <button key={t.id} onClick={() => {
                  const activeOrder = orders.find(o => o.tableId === t.id && statuses.findIndex(s => s.name === o.status) < statuses.length - 1);
                  if (activeOrder) {
                    editOrder(activeOrder);
                    setShowTableSelector(false);
                  } else {
                    setEditingOrderId(null);
                    setQoTable(t);
                    setShowTableSelector(false);
                    setCart([]);
                    setShowQuickOrder(true);
                  }
                }}
                  className="w-full px-4 py-3 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-base text-(--color-text-main)">{t.name}</span>
                    {isServing && <span className="text-[10px] bg-(--color-warning) text-(--color-bg-surface) px-1.5 py-0.5 rounded font-medium">Có khách</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-(--color-text-muted)">{t.areaName}</span>
                    <ChevronRight size={20} className="text-(--color-text-placeholder)" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderQuickOrder = () => {
    if (!showQuickOrder) return null;
    const hasMultipleCategories = categories.length > 1;
    const filteredMenu = qoCategoryFilter === 'all' || !hasMultipleCategories ? menuItems : menuItems.filter(m => m.categoryId === qoCategoryFilter);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartUniqueItems = cart.filter(i => i.qty > 0).length;

    const handleCartChange = (item: MenuItem | OrderItem, delta: number) => {
      setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
        if (delta > 0) return [...prev, { ...item, qty: 1, status: statuses.find(s => s.type === 'start')?.name || statuses[0].name }];
        return prev;
      });
    };

    return (
      <div
        className="absolute inset-0 bg-(--color-bg-main) z-80 flex flex-col animate-in slide-in-from-right-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeHandler('menu')}
      >
        {renderHeader(qoTable ? `${qoTable.areaName} - ${qoTable.name}` : 'Đơn Mang Về', <ChevronLeft size={24} />, () => {
          if (editingOrderId) { setShowQuickOrder(false); setEditingOrderId(null); setCart([]); }
          else { setShowQuickOrder(false); setShowTableSelector(true); }
        }, null, <ShoppingCart size={20} />)}

        {hasMultipleCategories && (
          <div className="bg-(--color-bg-surface) flex px-2 border-b border-(--color-border-main) overflow-x-auto no-scrollbar shrink-0">
            <button id="cat-tab-all" onClick={() => setQoCategoryFilter('all')} className={`py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${qoCategoryFilter === 'all' ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-text-secondary)'}`}>Tất cả</button>
            {categories.map(c => (
              <button key={c.id} id={`cat-tab-${c.id}`} onClick={() => setQoCategoryFilter(c.id)} className={`py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${qoCategoryFilter === c.id ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-text-secondary)'}`}>{c.name}</button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200 mt-4 mb-4">
            {filteredMenu.map(item => {
              const qty = cart.find(i => i.id === item.id)?.qty || 0;
              return (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-base text-(--color-text-main)">{item.name}</p>
                    <p className="text-sm text-(--color-text-secondary) mt-0.5 font-money">{formatMoney(item.price)}</p>
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => handleCartChange(item, 1)} className="w-8 h-8 rounded-full bg-(--color-bg-subtle) flex items-center justify-center text-(--color-primary) active:bg-(--color-border-main) transition-colors">
                      <Plus size={18} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleCartChange(item, -1)} className="w-8 h-8 rounded-full bg-(--color-bg-subtle) flex items-center justify-center text-(--color-primary) active:bg-(--color-border-main) transition-colors"><Minus size={18} /></button>
                      <span className="font-semibold text-lg w-4 text-center">{qty}</span>
                      <button onClick={() => handleCartChange(item, 1)} className="w-8 h-8 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center active:opacity-80 transition-colors"><Plus size={18} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {cartItemCount > 0 && (
          <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
            <div className="px-4 py-3 flex justify-between items-center bg-(--color-bg-active)">
              <span className="text-sm text-(--color-text-secondary)">{cartUniqueItems} món, {cartItemCount} phần</span>
              <span className="text-lg font-bold text-(--color-text-main) font-money">{formatMoney(cartTotal)}</span>
            </div>
            <button onClick={() => setShowOrderSummary(true)} className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg active:opacity-80 transition-opacity flex items-center justify-center gap-2">
              TIẾP TỤC
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderOrderSummary = () => {
    if (!showOrderSummary) return null;

    const split = orderSummarySplit;
    const grandTotal = split.newTotal + split.oldTotal;

    const isUpdating = editingOrderId && !isReadOnlySummary;

    return (
      <div
        className="absolute inset-0 bg-(--color-bg-main) z-90 flex flex-col animate-in slide-in-from-right-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeHandler('menu')}
      >
        {renderHeader(isReadOnlySummary ? 'Thông tin đơn' : 'Xác nhận đơn', <ChevronLeft size={24} />, () => setShowOrderSummary(false), null, isReadOnlySummary ? <Info size={20} /> : <CheckCircle2 size={20} />)}

        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Thông tin chung</div>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex justify-between items-center">
            <span className="text-base text-(--color-text-main)">Bàn phục vụ</span>
            <span className="text-base text-(--color-text-secondary)">{qoTable ? `${qoTable.areaName} - ${qoTable.name}` : 'Mang về'}</span>
          </div>

          {isUpdating ? (
            <>
              {split.new.length > 0 && (
                <>
                  <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Món mới thêm</div>
                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
                    {split.new.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <span className="text-(--color-text-secondary)">{item.qty}x</span>
                          <span className="text-(--color-text-main)">{item.name}</span>
                        </div>
                        <span className="text-(--color-text-secondary) font-money">{formatMoney(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-3 text-base font-bold text-(--color-text-main)">
                      <span>Tạm tính</span>
                      <span className="font-money">{formatMoney(split.newTotal)}</span>
                    </div>
                  </div>
                </>
              )}

              {split.old.length > 0 && (
                <>
                  <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Món đang phục vụ</div>
                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
                    {split.old.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3 text-base">
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="text-(--color-text-secondary)">{item.qty}x</span>
                            <span className="text-(--color-text-main)">{item.name}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] bg-(--color-bg-subtle) text-(--color-text-tertiary) px-1.5 py-0.5 rounded font-bold">{item.status}</span>
                          </div>
                        </div>
                        <span className="text-(--color-text-secondary) font-money">{formatMoney(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-3 text-base font-bold text-(--color-text-main)">
                      <span>Tạm tính</span>
                      <span className="font-money">{formatMoney(split.oldTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {split.flat.length > 0 && (
                <>
                  <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Danh sách món</div>
                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
                    {split.flat.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <span className="text-(--color-text-secondary)">{item.qty}x</span>
                          <span className="text-(--color-text-main)">{item.name}</span>
                        </div>
                        <span className="text-(--color-text-secondary) font-money">{formatMoney(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
          <div className="px-4 py-4 flex justify-between items-center">
            <span className="text-base font-bold text-(--color-text-main)">Tổng cộng</span>
            <span className="text-2xl font-bold text-(--color-success) font-money">{formatMoney(grandTotal)}</span>
          </div>
          {!isReadOnlySummary && (
            <button onClick={saveOrder} className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg active:opacity-80 transition-opacity">
              {editingOrderId ? 'Cập nhật' : 'Xác nhận'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // --- DASHBOARD ---
  const renderDashboard = () => {
    const currentDate = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="flex-1 bg-(--color-bg-main) flex flex-col overflow-y-auto no-scrollbar">
        {renderHeader(selectedStore?.name, null, null, null, <BarChart3 size={24} />, selectedStore?.address)}

        <div className="pb-safe">
          <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">{currentDate}</div>

          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plus size={20} className="text-(--color-success)" />
                <span className="text-sm text-(--color-text-main) font-semibold">Doanh thu</span>
              </div>
              <span className="text-sm font-semibold text-(--color-success) font-money">{formatMoney(stats.revenue)}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Minus size={20} className="text-(--color-danger)" />
                <span className="text-sm text-(--color-text-main) font-semibold">Nhập hàng</span>
              </div>
              <span className="text-sm font-semibold text-(--color-danger) font-money">{formatMoney(stats.expense)}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils size={20} className="text-(--color-warning)" />
                <span className="text-sm text-(--color-text-main) font-semibold">Đơn hàng</span>
              </div>
              <span className="text-sm font-semibold text-(--color-warning) font-money">{stats.orderCount}</span>
            </div>
          </div>

          <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Các món bán chạy</div>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
            {stats.topItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-(--color-text-muted)">Chưa có dữ liệu</div>
            ) : stats.topItems.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold 
                    ${idx === 0 ? 'bg-(--color-warning-light) text-(--color-warning-dark)' : 
                      idx === 1 ? 'bg-(--color-bg-subtle) text-(--color-text-emphasis)' : 
                      idx === 2 ? 'bg-(--color-bg-subtle) text-(--color-text-secondary)' : 
                      'bg-(--color-bg-subtle) text-(--color-text-muted)'}`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm text-(--color-text-main) font-semibold">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-(--color-text-main) font-money">{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- ORDERS TAB ---
  const renderOrdersTab = () => {
    const isEndFilter = statuses.findIndex(s => s.name === orderFilter) === statuses.length - 1;
    const filteredOrders = orders.filter(o => o.items.some(i => i.qty > 0 && i.status === orderFilter));

    return (
      <div
        className="flex-1 flex flex-col bg-(--color-bg-main) min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeHandler('orders')}
      >
        {renderHeader('Đơn Hàng', null, null, (
          <button onClick={startNewOrder} className="text-(--color-primary) active:opacity-50">
            <Plus size={24} />
          </button>
        ), <Utensils size={20} />)}

        <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto no-scrollbar shrink-0 sticky top-0 z-10">
          {statuses.map(s => {
            const count = orders.filter(o => o.items.some(i => i.qty > 0 && i.status === s.name)).length;
            const isActive = orderFilter === s.name;
            return (
              <button key={s.id} id={`status-tab-${s.name}`} onClick={() => setOrderFilter(s.name)}
                className={`py-3 px-4 text-sm whitespace-nowrap transition-colors border-b-2 flex items-center gap-2
                ${isActive ? 'border-(--color-primary) text-(--color-primary) font-medium' : 'border-transparent text-(--color-text-secondary)'}`}>
                {s.name} <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-(--color-primary-light) text-(--color-primary-dark)' : 'bg-(--color-bg-subtle) text-(--color-text-secondary)'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
              <Utensils size={48} className="mb-2 opacity-50" />
              <p className="text-sm">Không có đơn nào</p>
            </div>
          ) : filteredOrders.map(o => {
            const uniqueNames = new Set(o.items.filter(i => i.qty > 0).map(i => i.name));
            const itemCount = uniqueNames.size;
            const portionCount = o.items.reduce((acc, i) => acc + i.qty, 0);
            const visibleItems = o.items.filter(i => i.qty > 0 && i.status === orderFilter);

            return (
              <div key={o.id} className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) flex flex-col">
                <div className="px-4 h-10 flex justify-between items-center border-b border-(--color-border-main)">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-(--color-text-main) font-money">#{formatId(o.id)}</span>
                      <span className="text-(--color-text-muted)">•</span>
                      <span className="text-sm font-semibold text-(--color-text-main)">{o.tableName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-(--color-text-emphasis)">{o.time}</span>
                    <div className="flex items-center gap-4 border-l border-(--color-border-subtle) pl-4">
                      <button onClick={() => viewOrderSummary(o)} className="text-(--color-primary) active:opacity-50"><Info size={18} /></button>
                      {!isEndFilter && (
                        <button onClick={() => editOrder(o)} className="text-(--color-warning) active:opacity-50"><Edit3 size={18} /></button>
                      )}
                      <button onClick={() => deleteOrder(o.id)} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2">
                  {visibleItems.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center ${idx !== visibleItems.length - 1 ? 'mb-1 pb-1 border-b border-(--color-border-main) border-dashed' : ''}`}>
                      <div className="flex items-center italic">
                        <span className="text-sm text-(--color-text-main) min-w-[40px]">{item.qty}x</span>
                        <span className="text-sm text-(--color-text-emphasis)">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-stretch border-t border-(--color-border-main) overflow-hidden h-10">
                  <div className="flex items-center text-[12px] text-(--color-text-emphasis) px-4">
                    {itemCount} món • {portionCount} phần
                  </div>

                  <div className="flex flex-1">
                    <button onClick={() => moveOrderStatus(o.id, -1)}
                      className="flex-1 flex items-center justify-center gap-1 border-l active:bg-(--color-primary-light) border-(--color-border-subtle) text-(--color-primary) transition-colors">
                      <ArrowLeftFromLine size={14} />
                    </button>
                    <button onClick={() => moveOrderStatus(o.id, 1)}
                      className="flex-[1.5] flex items-center justify-center gap-1 active:bg-(--color-primary-light) border-l border-(--color-border-subtle) text-(--color-primary) transition-colors">
                      <ArrowRightFromLine size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // --- INVENTORY TAB ---
  const renderInventoryTab = () => (
    <div className="flex-1 flex flex-col bg-(--color-bg-main) min-h-0">
      {renderHeader('Nhập hàng', null, null, (
        <button onClick={() => setModal({ isOpen: true, type: 'invoice', data: null })} className="text-(--color-primary) active:opacity-50">
          <Plus size={24} />
        </button>
      ), <PackageSearch size={20} />)}
      <div className="flex-1 overflow-y-auto pb-safe">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
            <PackageSearch size={48} className="mb-2 opacity-50" />
            <p className="text-sm">Chưa có phiếu nhập nào</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {invoices.map(inv => (
              <div key={inv.id} className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm text-(--color-text-main) font-semibold truncate">{inv.supplier || 'Phiếu nhập'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-(--color-text-secondary)">{inv.date}</p>
                    <span className="text-(--color-text-placeholder) text-xs">•</span>
                    <span className="text-sm text-(--color-danger) font-semibold font-money">{formatMoney(inv.total)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 border-l border-(--color-border-subtle) pl-4">
                  <button onClick={() => setModal({ isOpen: true, type: 'invoice', data: inv })} className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
                  <button onClick={() => openConfirm(`Xóa phiếu ${inv.supplier || 'không tên'}?`, 'Hành động này không thể hoàn tác.', () => { setInvoices(prev => prev.filter(i => i.id !== inv.id)); setConfirmDialog(prev => ({ ...prev, isOpen: false })); })} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- SETTINGS TABS ---
  const renderSettingsMain = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
      {renderHeader('Quản lý', null, null, null, <Settings size={20} />)}
      <div className="flex-1 overflow-y-auto pb-safe">

        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) flex items-center gap-4 px-4 py-3 mt-4">
          <div className="w-12 h-12 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center font-bold text-xl">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-(--color-text-main) font-semibold">{currentUser?.name}</p>
            <p className="text-sm text-(--color-text-secondary)">{currentUser?.phone}</p>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className="text-sm text-(--color-text-secondary)">Dữ liệu & Vận hành</span>
        </div>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
          <button onClick={() => setSubView('settings_stores')} className="w-full px-4 py-3 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--color-primary-light) text-(--color-primary-dark) flex items-center justify-center">
                <StoreIcon size={18} />
              </div>
              <span className="text-sm text-(--color-text-main) font-medium">Cửa hàng</span>
            </div>
            <ChevronRight size={20} className="text-(--color-text-placeholder)" />
          </button>
          <button onClick={() => setSubView('settings_menu')} className="w-full px-4 py-3 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--color-warning-light) text-(--color-warning-dark) flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <span className="text-sm text-(--color-text-main) font-medium">Thực đơn</span>
            </div>
            <ChevronRight size={20} className="text-(--color-text-placeholder)" />
          </button>
          <button onClick={() => setSubView('settings_tables')} className="w-full px-4 py-3 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--color-success-light) text-(--color-success) flex items-center justify-center">
                <Grid size={18} />
              </div>
              <span className="text-sm text-(--color-text-main) font-medium">Khu vực</span>
            </div>
            <ChevronRight size={20} className="text-(--color-text-placeholder)" />
          </button>
          <button onClick={() => setSubView('settings_statuses')} className="w-full px-4 py-3 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--color-info-light) text-(--color-info) flex items-center justify-center">
                <Activity size={18} />
              </div>
              <span className="text-sm text-(--color-text-main) font-medium">Quy trình</span>
            </div>
            <ChevronRight size={20} className="text-(--color-text-placeholder)" />
          </button>
        </div>

        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
          <button onClick={() => { setCurrentUser(null); setRoute('auth'); }} className="w-full px-4 py-3 flex items-center justify-start gap-3 text-(--color-danger) active:bg-(--color-bg-subtle) transition-colors">
            <div className="w-8 h-8 rounded-lg bg-(--color-danger-light) flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <span className="text-sm font-semibold">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingsMenu = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
      {renderHeader('Thực đơn', <ChevronLeft size={24} />, () => setSubView('main'), null, <BookOpen size={20} />)}
      <div className="flex-1 overflow-y-auto pb-safe">

        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200 mt-4">
          <button onClick={() => setModal({ isOpen: true, type: 'category', data: {} })} className="w-full text-(--color-primary) py-3 text-base active:bg-(--color-bg-subtle) text-left px-4 flex items-center gap-3">
            <Plus size={18} /> Thêm Danh Mục
          </button>
          <button onClick={() => setModal({ isOpen: true, type: 'menu_item', data: {} })} className="w-full text-(--color-primary) py-3 text-base active:bg-(--color-bg-subtle) text-left px-4 flex items-center gap-3">
            <Plus size={18} /> Thêm Món Ăn
          </button>
        </div>

        <div>
          {categories.map(cat => {
            const catItems = menuItems.filter(m => m.categoryId === cat.id);
            return (
              <div key={cat.id}>
                <div className="p-4 pb-2 flex justify-between items-end">
                  <span className="text-sm text-(--color-text-secondary)">{cat.name}</span>
                  <div className="flex gap-4">
                    <button onClick={() => setModal({ isOpen: true, type: 'category', data: cat })} className="text-(--color-warning) active:opacity-50 text-sm">Sửa</button>
                    <button onClick={() => openConfirm(`Xóa danh mục ${cat.name}?`, 'Hành động này không thể hoàn tác.', () => {
                      setCategories(prev => prev.filter(c => c.id !== cat.id));
                      setMenuItems(prev => prev.filter(m => m.categoryId !== cat.id));
                      setConfirmDialog({ ...confirmDialog, isOpen: false });
                    })} className="text-(--color-danger) active:opacity-50 text-sm">Xóa</button>
                  </div>
                </div>
                <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
                  {catItems.map(m => (
                    <div key={m.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-base text-(--color-text-main)">{m.name}</p>
                        <p className="text-sm text-(--color-text-secondary) mt-0.5 font-money">{formatMoney(m.price)}</p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setModal({ isOpen: true, type: 'menu_item', data: m })} className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
                        <button onClick={() => openConfirm(`Xóa món ${m.name}?`, 'Hành động này không thể hoàn tác.', () => {
                          setMenuItems(prev => prev.filter(i => i.id !== m.id));
                          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                        })} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {catItems.length === 0 && <p className="p-4 text-sm text-(--color-text-muted)">Trống</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettingsTables = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
      {renderHeader('Khu vực', <ChevronLeft size={24} />, () => setSubView('main'), (
        <button onClick={() => setModal({ isOpen: true, type: 'area', data: {} })} className="text-(--color-primary) active:opacity-50"><Plus size={24} /></button>
      ), <Grid size={20} />)}
      <div className="flex-1 overflow-y-auto pb-safe">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
          {areas.map(area => (
            <div key={area.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-base text-(--color-text-main)">{area.name}</p>
                <p className="text-sm text-(--color-text-secondary)">{area.tableCount} bàn</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setModal({ isOpen: true, type: 'area', data: area })} className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
                <button onClick={() => openConfirm(`Xóa khu vực ${area.name}?`, 'Hành động này không thể hoàn tác.', () => {
                  setAreas(prev => prev.filter(a => a.id !== area.id));
                  setTables(prev => prev.filter(t => t.areaId !== area.id));
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                })} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsStatuses = () => {
    const endStatus = statuses.find(s => s.type === 'end')?.name;
    const canEdit = orders.every(o => o.status === endStatus);

    const moveStatus = (idx: number, dir: number) => {
      if (!canEdit) return;
      const newIdx = idx + dir;
      if (newIdx < 1 || newIdx >= statuses.length - 1) return;
      const newStatuses = [...statuses];
      [newStatuses[idx], newStatuses[newIdx]] = [newStatuses[newIdx], newStatuses[idx]];
      setStatuses(newStatuses);
    };

    return (
      <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
        {renderHeader('Quy trình', <ChevronLeft size={24} />, () => setSubView('main'),
          canEdit ? <button onClick={() => setModal({ isOpen: true, type: 'status', data: {} })} className="text-(--color-primary) active:opacity-50"><Plus size={24} /></button> : null,
          <Activity size={20} />
        )}
        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">Danh sách Trạng thái</div>

          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
            {statuses.map((s, idx) => (
              <div key={s.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-(--color-text-muted)">{idx + 1}.</span>
                  <div>
                    <p className="text-base text-(--color-text-main)">{s.name}</p>
                    <p className="text-xs text-(--color-text-secondary)">{s.type === 'start' ? 'Bắt đầu' : s.type === 'end' ? 'Kết thúc' : 'Bước đệm'}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-4">
                    {s.type === 'mid' && (
                      <div className="flex flex-col -my-2 mr-2">
                        <button onClick={() => moveStatus(idx, -1)} disabled={idx <= 1} className="p-1 text-(--color-primary) disabled:text-(--color-text-placeholder) active:opacity-50">
                          <ChevronUp size={16} />
                        </button>
                        <button onClick={() => moveStatus(idx, 1)} disabled={idx >= statuses.length - 2} className="p-1 text-(--color-primary) disabled:text-(--color-text-placeholder) active:opacity-50">
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}
                    <button onClick={() => setModal({ isOpen: true, type: 'status', data: s })} className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
                    {s.type === 'mid' && <button onClick={() => openConfirm(`Xóa trạng thái ${s.name}?`, 'Hành động này không thể hoàn tác.', () => {
                      setStatuses(prev => prev.filter(st => st.id !== s.id));
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    })} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!canEdit && (
            <p className="p-4 text-sm text-(--color-text-secondary)">Hoàn tất tất cả đơn hàng để chỉnh sửa trạng thái.</p>
          )}
        </div>
      </div>
    )
  };

  const renderSettingsStores = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
      {renderHeader('Cửa hàng', <ChevronLeft size={24} />, () => setSubView('main'), (
        <button onClick={() => { setEditingStore(null); setRoute('create_store'); }} className="text-(--color-primary) active:opacity-50">
          <Plus size={24} />
        </button>
      ), <StoreIcon size={20} />)}
      <div className="flex-1 overflow-y-auto pb-safe">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-100">
          {stores.map(s => (
            <div key={s.id} className="w-full flex items-center bg-(--color-bg-surface)">
              <button onClick={() => { setSelectedStore(s); setSubView('main'); }}
                className="flex-1 px-4 py-4 flex items-center justify-between active:bg-(--color-bg-subtle) transition-colors text-left">
                <div className="flex flex-col">
                  <span className={`text-[15px] font-semibold ${selectedStore?.id === s.id ? 'text-(--color-primary)' : 'text-(--color-text-main)'}`}>{s.name}</span>
                  <span className="text-[12px] text-(--color-text-secondary) mt-0.5">{s.address}</span>
                </div>
                {selectedStore?.id === s.id && (
                  <div className="w-5 h-5 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center mr-2"><Check size={12} /></div>
                )}
              </button>
              <div className="flex items-center gap-4 pr-4 border-l border-(--color-border-subtle) pl-4 h-10 my-2">
                <button onClick={() => { setEditingStore(s); setRoute('create_store'); }} className="text-(--color-warning) active:opacity-50"><Pencil size={18} /></button>
                <button onClick={() => openConfirm(`Xóa cửa hàng ${s.name}?`, 'Hành động này không thể hoàn tác.', () => {
                  setStores(prev => prev.filter(st => st.id !== s.id));
                  if (selectedStore?.id === s.id) setSelectedStore(null);
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                })} className="text-(--color-danger) active:opacity-50"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modal.isOpen) return null;
    const close = () => setModal({ isOpen: false, type: null, data: null });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = fd.get('name') as string;

      if (modal.type === 'category') {
        const cat: Category = { id: modal.data?.id || `c${Date.now()}`, name };
        if (modal.data?.id) setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
        else setCategories([...categories, cat]);
      }
      else if (modal.type === 'menu_item') {
        const item: MenuItem = {
          id: modal.data?.id || `m${Date.now()}`,
          name, price: Number(fd.get('price')), categoryId: fd.get('categoryId') as string
        };
        if (modal.data?.id) setMenuItems(prev => prev.map(m => m.id === item.id ? item : m));
        else setMenuItems([...menuItems, item]);
      }
      else if (modal.type === 'area') {
        const areaId = modal.data?.id || `a${Date.now()}`;
        const newCount = Number(fd.get('tableCount'));
        const area: Area = { id: areaId, name, tableCount: newCount };

        if (modal.data?.id) {
          setAreas(prev => prev.map(a => a.id === area.id ? area : a));
          setTables(prev => {
            const otherTables = prev.filter(t => t.areaId !== area.id);
            const newTables: Table[] = [];
            for (let i = 1; i <= newCount; i++) newTables.push({ id: `t_${area.id}_${i}`, name: `Bàn ${i}`, areaId: area.id });
            return [...otherTables, ...newTables];
          });
        }
        else {
          setAreas([...areas, area]);
          const newTables: Table[] = [];
          for (let i = 1; i <= newCount; i++) newTables.push({ id: `t_${area.id}_${i}`, name: `Bàn ${i}`, areaId: area.id });
          setTables([...tables, ...newTables]);
        }
      }
      else if (modal.type === 'status') {
        if (modal.data?.id) {
          setStatuses(prev => prev.map(s => s.id === modal.data.id ? { ...s, name } : s));
        } else {
          const newStatus: Status = { id: `st${Date.now()}`, name, type: 'mid' };
          const newStatuses = [...statuses];
          const endIndex = newStatuses.findIndex(s => s.type === 'end');
          newStatuses.splice(endIndex, 0, newStatus);
          setStatuses(newStatuses);
        }
      }
      close();
    };

    return (
      <div className="absolute inset-0 bg-(--color-bg-main) z-90 flex flex-col animate-in slide-in-from-right-4">
        {renderHeader(
          modal.type === 'category' ? (modal.data?.id ? 'Sửa Danh Mục' : 'Thêm Danh Mục') :
            modal.type === 'menu_item' ? (modal.data?.id ? 'Sửa Món' : 'Thêm Món') :
              modal.type === 'area' ? (modal.data?.id ? 'Sửa Khu Vực' : 'Thêm Khu Vực') :
                modal.type === 'invoice' ? 'Phiếu Nhập' : (modal.data?.id ? 'Sửa Trạng Thái' : 'Thêm Trạng Thái'),
          <ChevronLeft size={24} />, close, null,
          modal.type === 'category' ? <Layers size={20} /> :
            modal.type === 'menu_item' ? <Utensils size={20} /> :
              modal.type === 'area' ? <Grid size={20} /> :
                modal.type === 'invoice' ? <FileText size={20} /> : <Clock size={20} />
        )}

        {modal.type === 'invoice' ? (
          <InvoiceFormModal
            initialData={modal.data}
            onSave={(inv) => {
              if (modal.data?.id) setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i));
              else setInvoices([inv, ...invoices]);
              close();
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pb-safe">
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200 mt-4">
                {modal.type === 'category' && (
                  <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Tên</span><input autoFocus required name="name" defaultValue={modal.data?.name} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" placeholder="Tên danh mục" /></div>
                )}
                {modal.type === 'menu_item' && (
                  <>
                    <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Tên</span><input autoFocus required name="name" defaultValue={modal.data?.name} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" placeholder="Tên món" /></div>
                    <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Giá</span><input required type="number" name="price" defaultValue={modal.data?.price} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" placeholder="0" /></div>
                    <div className="flex px-4 py-3 items-center"><span className="w-1/3 text-(--color-text-main)">Danh mục</span>
                      <select name="categoryId" defaultValue={modal.data?.categoryId || categories[0]?.id} className="flex-1 outline-none bg-transparent appearance-none text-right text-(--color-text-main)">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {modal.type === 'area' && (
                  <>
                    <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Tên</span><input autoFocus required name="name" defaultValue={modal.data?.name} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" placeholder="Khu vực" /></div>
                    <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Số lượng</span><input required type="number" min="1" name="tableCount" defaultValue={modal.data?.tableCount || 1} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" placeholder="1" /></div>
                  </>
                )}
                {modal.type === 'status' && (
                  <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Tên</span><input autoFocus required name="name" defaultValue={modal.data?.name} placeholder="Đang nấu..." className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" /></div>
                )}
              </div>
            </div>

            <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
              <button type="submit" className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg active:opacity-80 transition-opacity">
                Lưu
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const InvoiceFormModal = ({ initialData, onSave }: { initialData: Invoice | null, onSave: (inv: Invoice) => void }) => {
    const [supplier, setSupplier] = useState(initialData?.supplier || '');
    const [total, setTotal] = useState(initialData?.total?.toString() || '');

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!supplier || !total) return;
        onSave({
          id: initialData?.id || `INV-${Date.now()}`,
          supplier: supplier,
          date: initialData?.date || new Date().toLocaleDateString('vi-VN'),
          total: Number(total)
        });
      }} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200 mt-4">
            <div className="flex px-4 py-3">
              <span className="w-1/3 text-(--color-text-main)">Mô tả</span>
              <input autoFocus placeholder="Tiền điện..." value={supplier} onChange={e => setSupplier(e.target.value)} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" />
            </div>
            <div className="flex px-4 py-3">
              <span className="w-1/3 text-(--color-text-main)">Số tiền</span>
              <input type="number" placeholder="0" value={total} onChange={e => setTotal(e.target.value)} className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" />
            </div>
          </div>
        </div>

        <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
          <button type="submit" disabled={!supplier || !total} className="w-full py-4 bg-(--color-primary) text-(--color-bg-surface) text-center text-lg font-bold disabled:opacity-50 active:opacity-80 transition-opacity">Lưu</button>
        </div>
      </form>
    );
  };

  // ==========================================
  // VIEW: AUTH & CREATE STORE
  // ==========================================
  const renderAuth = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col min-h-0">
      <div className="bg-(--color-bg-surface) border-b border-(--color-border-main) p-12 flex flex-col items-center justify-center shrink-0">
        <div className="w-12 h-12 bg-(--color-primary) flex items-center justify-center text-(--color-bg-surface) mb-4">
          <StoreIcon size={24} />
        </div>
        <h1 className="text-2xl font-bold text-(--color-text-main) tracking-tight">Orderly</h1>
        <div className="mt-1 h-0.5 w-8 bg-(--color-primary)"></div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-4 pb-2 text-sm text-(--color-text-secondary)">
          {authMode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}
        </div>

        <form onSubmit={handleAuth} className="flex-1 flex flex-col min-h-0">
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-100">
            {authMode === 'register' && (
              <div className="px-4 py-5 flex items-center gap-4 bg-(--color-bg-surface)">
                <User className="text-(--color-text-placeholder)" size={18} />
                <input autoFocus required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Họ và Tên" className="flex-1 bg-transparent outline-none text-sm font-medium text-(--color-text-main) placeholder:text-(--color-text-placeholder)" />
              </div>
            )}
            <div className="px-4 py-5 flex items-center gap-4 bg-(--color-bg-surface)">
              <Phone className="text-(--color-text-placeholder)" size={18} />
              <input autoFocus={authMode === 'login'} required type="tel" value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} placeholder="Số điện thoại" className="flex-1 bg-transparent outline-none text-sm font-medium text-(--color-text-main) placeholder:text-(--color-text-placeholder)" />
            </div>
            <div className="px-4 py-5 flex items-center gap-4 bg-(--color-bg-surface)">
              <Lock className="text-(--color-text-placeholder)" size={18} />
              <input required type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Mật khẩu" className="flex-1 bg-transparent outline-none text-sm font-medium text-(--color-text-main) placeholder:text-(--color-text-placeholder)" />
            </div>
          </div>

          <div className="mt-auto">
            <button type="submit" className="w-full py-4 bg-(--color-primary) text-(--color-bg-surface) font-bold text-lg active:opacity-80 transition-opacity flex items-center justify-center gap-3">
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
            </button>

            <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthForm({ name: '', phone: '0901234567', password: 'password123', confirmPassword: '' }) }}
              className="w-full py-6 bg-(--color-bg-surface) border-t border-(--color-border-main) text-sm font-medium text-(--color-primary) active:bg-(--color-bg-active) transition-colors flex items-center justify-center gap-2">
              {authMode === 'login' ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Tôi đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCreateStore = () => (
    <div className="flex-1 bg-(--color-bg-main) flex flex-col overflow-y-auto no-scrollbar relative">
      {renderHeader(editingStore ? 'Sửa Cửa Hàng' : 'Tạo Cửa Hàng', <ChevronLeft size={24} />, () => { setEditingStore(null); stores.length > 0 ? setRoute('app') : setRoute('auth'); }, null, <StoreIcon size={20} />)}
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('name') as string;
        const address = fd.get('address') as string;
        const storeData: Store = { id: editingStore?.id || `s${Date.now()}`, name, address };

        if (editingStore) {
          setStores(prev => prev.map(s => s.id === editingStore.id ? storeData : s));
          if (selectedStore?.id === editingStore.id) setSelectedStore(storeData);
        } else {
          setStores([...stores, storeData]);
          setSelectedStore(storeData);
        }

        setEditingStore(null);
        setRoute('app');
        setActiveTab('dashboard');
      }} className="flex-1 flex flex-col min-h-0">

        <div className="flex-1 pb-safe">
          <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
            <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Tên quán</span><input autoFocus required name="name" defaultValue={editingStore?.name} placeholder="Orderly Cafe" className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" /></div>
            <div className="flex px-4 py-3"><span className="w-1/3 text-(--color-text-main)">Địa chỉ</span><input required name="address" defaultValue={editingStore?.address} placeholder="Quận/Huyện..." className="flex-1 outline-none bg-transparent text-(--color-text-main) text-right" /></div>
          </div>
        </div>

        <div className="bg-(--color-bg-surface) border-t border-(--color-border-main) pb-safe shrink-0">
          <button type="submit" className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg active:opacity-80 transition-opacity">
            {editingStore ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </div>
  );

  // ==========================================
  // MAIN RETURN
  // ==========================================
  return (
    <div className="bg-(--color-bg-subtle) h-svh flex justify-center items-center font-sans text-(--color-text-main)">
      <ThemeStyles />

      <div className="w-full max-w-[480px] h-svh bg-(--color-bg-surface) relative overflow-hidden flex flex-col mx-auto border-x border-(--color-border-main)">

        {confirmDialog.isOpen && (
          <div className="absolute inset-0 bg-(--color-text-main)/40 z-100 flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-(--color-bg-surface) rounded-2xl w-full overflow-hidden animate-in zoom-in-95">
              <div className="p-6 text-center">
                <h3 className="font-bold text-(--color-text-main) text-lg mb-2">{confirmDialog.title}</h3>
                <p className="text-(--color-text-secondary) text-sm">{confirmDialog.message}</p>
              </div>
              <div className="flex border-t border-(--color-border-main)">
                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-4 text-(--color-text-secondary) text-base active:bg-(--color-bg-subtle) border-r border-(--color-border-main)">Hủy</button>
                <button onClick={confirmDialog.onConfirm} className="flex-1 py-4 text-(--color-danger) font-bold text-base active:bg-(--color-bg-subtle)">Xóa</button>
              </div>
            </div>
          </div>
        )}

        {/* Main Routing */}
        {route === 'auth' && renderAuth()}
        {route === 'create_store' && renderCreateStore()}

        {route === 'app' && (
          <div className="flex-1 flex flex-col min-h-0 relative bg-(--color-bg-main)">
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'orders' && renderOrdersTab()}
              {activeTab === 'imports' && renderInventoryTab()}

              {activeTab === 'settings' && subView === 'main' && renderSettingsMain()}
              {activeTab === 'settings' && subView === 'settings_menu' && renderSettingsMenu()}
              {activeTab === 'settings' && subView === 'settings_tables' && renderSettingsTables()}
              {activeTab === 'settings' && subView === 'settings_statuses' && renderSettingsStatuses()}
              {activeTab === 'settings' && subView === 'settings_stores' && renderSettingsStores()}
            </div>

            {renderTableSelector()}
            {renderQuickOrder()}
            {renderOrderSummary()}
            {renderModal()}

            {/* Bottom Nav */}
            {subView === 'main' && !showQuickOrder && !showTableSelector && (
              <nav className="bg-(--color-bg-surface)/90 backdrop-blur-md border-t border-(--color-border-main) flex justify-around items-center h-[60px] pb-safe shrink-0 relative z-10">
                <NavItem icon={<BarChart3 />} label="Tổng quan" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavItem icon={<Utensils />} label="Đơn hàng" isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                <NavItem icon={<PackageSearch />} label="Nhập hàng" isActive={activeTab === 'imports'} onClick={() => setActiveTab('imports')} />
                <NavItem icon={<Settings />} label="Quản lý" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactElement, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 duration-200">
      <div className={`${isActive ? 'text-(--color-primary)' : 'text-(--color-text-tertiary)'}`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: isActive ? 2.5 : 2 } as any)}
      </div>
      <span className={`text-[10px] mt-0.5 ${isActive ? 'text-(--color-primary) font-medium' : 'text-(--color-text-tertiary) font-medium'}`}>{label}</span>
    </button>
  );
}