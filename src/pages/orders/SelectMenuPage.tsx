import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Plus, Minus, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

export const SelectMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const categoryIdParam = searchParams.get('categoryId') || 'all';

  const categories = [
    { id: 1, name: 'Cà phê' },
    { id: 2, name: 'Trà hoa quả' },
    { id: 3, name: 'Bánh ngọt' },
  ];

  const menuItems = [
    { id: 1, name: 'Cà phê Sữa đá', price: 29000, categoryId: 1 },
    { id: 2, name: 'Cà phê Đen đá', price: 25000, categoryId: 1 },
    { id: 3, name: 'Bạc xỉu', price: 32000, categoryId: 1 },
    { id: 4, name: 'Trà Đào Cam Sả', price: 39000, categoryId: 2 },
    { id: 5, name: 'Trà Vải Nhiệt Đới', price: 39000, categoryId: 2 },
    { id: 6, name: 'Bánh Mì Quế', price: 20000, categoryId: 3 },
    { id: 7, name: 'Croissant Phô Mai', price: 35000, categoryId: 3 },
  ];

  const formatMoney = (val: number) => val.toLocaleString() + ' đ';

  const setCategoryId = (id: number | 'all') => {
    setSearchParams({ categoryId: String(id) }, { replace: true });
  };

  const hasMultipleCategories = categories.length > 1;
  const filteredMenu =
    categoryIdParam === 'all' || !hasMultipleCategories
      ? menuItems
      : menuItems.filter((m) => m.categoryId === Number(categoryIdParam));

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  useEffect(() => {
    if (categoryIdParam) {
      scrollTabIntoView(`cat-tab-${categoryIdParam}`);
    }
  }, [categoryIdParam]);

  const [cart, setCart] = useState<any[]>([
    { id: 1, name: 'Cà phê Sữa đá', price: 29000, qty: 1 }
  ]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartUniqueItems = cart.filter((i) => i.qty > 0).length;

  const handleCartChange = (item: { id: number; name: string; price: number }, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = Math.max(0, existing.qty + delta);
        return prev.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i));
      } else if (delta > 0) {
        return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
      }
      return prev;
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Chọn món"
        Icon={BookOpen}
        backUrl={paths.orders.selectTable}
      />

      {hasMultipleCategories && (
        <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto shrink-0">
          <button
            id="cat-tab-all"
            onClick={() => setCategoryId('all')}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 flex items-center gap-2',
              categoryIdParam === 'all' && 'border-(--color-primary) text-(--color-primary)',
              categoryIdParam !== 'all' && 'border-transparent text-(--color-text-secondary)',
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
                'py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2',
                categoryIdParam === String(c.id) && 'border-(--color-primary) text-(--color-primary)',
                categoryIdParam !== String(c.id) && 'border-transparent text-(--color-text-secondary)',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {filteredMenu.map((item) => {
                const qty = cart.find((i) => i.id === item.id)?.qty || 0;
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-(--color-text-main) truncate">{item.name}</p>
                      <p className="text-(--color-text-secondary) mt-0.5 tabular-nums">
                        {formatMoney(item.price)}
                      </p>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleCartChange(item, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-(--color-bg-main) text-(--color-primary)"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleCartChange(item, -1)}
                          className="w-8 h-8 rounded-full bg-(--color-bg-main) flex items-center justify-center text-(--color-primary)"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-semibold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => handleCartChange(item, 1)}
                          className="w-8 h-8 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center"
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
            onClick={() => navigate(paths.orders.summary, { state: { stepCount: (location.state?.stepCount || 1) + 1 } })}
            className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  );
};
