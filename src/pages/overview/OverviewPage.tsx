import { BarChart3, Plus, Minus, Utensils } from 'lucide-react';
import { Header } from '@/components/Header';
import { formatMoney } from '@/utils/formatMoney';
import { useStoreStore } from '@/stores/store.store';

export const OverviewPage: React.FC = () => {
  const store = useStoreStore((s) => s.store);

  const data = {
    revenue: 12500000,
    expense: 3200000,
    orderCount: 48,
    topItems: [
      { name: 'Cà phê Sữa đá', qty: 120 },
      { name: 'Trà Đào Cam Sả', qty: 85 },
      { name: 'Bánh Mì Quế', qty: 64 },
    ]
  }

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={store.name}
        subtitle={store.address || undefined}
        Icon={BarChart3}
      />

      <div className='flex-1 relative'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 overflow-auto pb-4'>
            <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">{currentDate}</div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plus size={20} className="text-(--color-success)" />
                  <span className="font-medium">Doanh thu</span>
                </div>
                <span className="font-semibold text-(--color-success) tabular-nums">
                  {formatMoney(data.revenue)}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Minus size={20} className="text-(--color-danger)" />
                  <span className="font-medium">Chi tiêu</span>
                </div>
                <span className="font-semibold text-(--color-danger) tabular-nums">
                  {formatMoney(data.expense)}
                </span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils size={20} className="text-(--color-warning)" />
                  <span className="font-semibold">Đơn hàng</span>
                </div>
                <span className="font-semibold text-(--color-warning) tabular-nums">
                  {data.orderCount}
                </span>
              </div>
            </div>

            <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">Các món bán chạy</div>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {data.topItems.map((item, index) => (
                <div key={index} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className='font-semibold'>{index + 1}.</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="tabular-nums">
                    {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
