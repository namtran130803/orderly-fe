import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Utensils,
  Info,
  Edit3,
  Trash2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  CirclePlus,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusIdParam = searchParams.get('statusId');

  const setStatusId = (id: number) => {
    setSearchParams({ statusId: String(id) }, { replace: true });
  };

  const statuses = [
    { id: 1, name: 'Chờ xử lý', type: 'start' },
    { id: 2, name: 'Đang chuẩn bị', type: 'mid' },
    { id: 3, name: 'Hoàn thành', type: 'end' },
  ];

  const allMockOrders = [
    {
      id: 101,
      tableId: 1,
      tableName: 'Bàn 101',
      status: 'Chờ xử lý',
      time: '08:30',
      total: 87000,
      items: [
        { id: 1, name: 'Cà phê Sữa đá', price: 29000, qty: 2, status: 'Chờ xử lý' },
        { id: 2, name: 'Cà phê Đen đá', price: 25000, qty: 1, status: 'Chờ xử lý' },
      ],
    },
    {
      id: 102,
      tableId: 4,
      tableName: 'Bàn 201',
      status: 'Đang chuẩn bị',
      time: '08:45',
      total: 78000,
      items: [
        { id: 4, name: 'Trà Đào Cam Sả', price: 39000, qty: 2, status: 'Đang chuẩn bị' },
      ],
    },
    {
      id: 103,
      tableId: null,
      tableName: 'Mang về',
      status: 'Hoàn thành',
      time: '09:00',
      total: 35000,
      items: [
        { id: 7, name: 'Croissant Phô Mai', price: 35000, qty: 1, status: 'Hoàn thành' },
      ],
    },
  ];

  const formatId = (val: number) => String(val).padStart(4, '0');

  const currentStatus = statuses.find((s) => String(s.id) === statusIdParam) || statuses[0];
  const currentFilter = currentStatus?.name || '';
  const currentIdx = statuses.findIndex((s) => s.id === currentStatus?.id);
  const isEndFilter = currentIdx === statuses.length - 1;

  const filteredOrders = allMockOrders.filter((o) => o.status === currentFilter);

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  useEffect(() => {
    if (currentStatus) {
      scrollTabIntoView(`status-tab-${currentStatus.id}`);
      if (!statusIdParam) {
        setStatusId(currentStatus.id);
      }
    }
  }, [currentStatus, statusIdParam]);

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Đơn Hàng" Icon={Utensils}>
        <Link
          to={paths.orders.selectTable}
          className="text-(--color-primary)"
        >
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main)">
        {statuses.map((s) => {
          const isActive = currentFilter === s.name;
          return (
            <button
              key={s.id}
              id={`status-tab-${s.id}`}
              onClick={() => setStatusId(s.id)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 flex items-center gap-2',
                isActive && 'border-(--color-primary) text-(--color-primary)',
                !isActive && 'border-transparent text-(--color-text-secondary)',
              )}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <Utensils size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có đơn nào</p>
              </div>
            ) : (
              filteredOrders.map((o) => {
                const visibleItems = o.items.filter(
                  (item: any) => item.qty > 0 && item.status === currentFilter
                );

                const groupedItems = visibleItems.reduce((acc: any[], item: any) => {
                  const existing = acc.find((i) => i.id === item.id);
                  if (existing) {
                    existing.qty += item.qty;
                  } else {
                    acc.push({ ...item });
                  }
                  return acc;
                }, []);
                const uniqueNames = new Set(o.items.filter((i: any) => i.qty > 0).map((i: any) => i.name));
                const itemCount = uniqueNames.size;
                const portionCount = o.items.reduce((acc: number, i: any) => acc + i.qty, 0);

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
                          {o.tableName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate(paths.orders.summary)}
                            className="text-(--color-primary)"
                          >
                            <Info size={20} />
                          </button>
                          {!isEndFilter && (
                            <button
                              onClick={() => navigate(paths.orders.selectMenu)}
                              className="text-(--color-warning)"
                            >
                              <Edit3 size={20} />
                            </button>
                          )}
                          <button
                            className="text-(--color-danger)"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2">
                      {groupedItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex justify-between items-center',
                            idx !== visibleItems.length - 1 && 'mb-1 pb-1 border-b border-(--color-border-main) border-dashed',
                          )}
                        >
                          <div className="flex items-center">
                            <span className="text-(--color-text-main) min-w-[40px]">
                              {item.qty}x
                            </span>
                            <span className="text-(--color-text-emphasis)">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-stretch border-t border-(--color-border-main) overflow-hidden h-10">
                      <div className="flex items-center gap-2 text-xs text-(--color-text-emphasis) px-4">
                        {o.time}
                        <span className="text-(--color-text-muted)">•</span>
                        {itemCount} món
                        {portionCount} phần
                      </div>

                      <div className="flex flex-1">
                        <button
                          className="flex-1 flex items-center justify-center gap-1 border-l border-(--color-border-subtle) text-(--color-primary)"
                        >
                          <ArrowLeftFromLine size={14} />
                        </button>
                        <button
                          className="flex-[1.5] flex items-center justify-center gap-1 border-l border-(--color-border-subtle) text-(--color-primary)"
                        >
                          <ArrowRightFromLine size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
