import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Info } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

export const SummaryOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const isReadOnly = false;
  const isEditing = false;
  const table = { name: 'Bàn 101' };
  const cart = [
    { id: 1, name: 'Cà phê Sữa đá', price: 29000, qty: 2, status: 'Chờ xử lý', originalItems: [] }
  ];
  const startSt = 'Chờ xử lý';
  const formatMoney = (val: number) => val.toLocaleString() + ' đ';

  const oldItems: any[] = [];
  const newItems = cart.map((item) => ({ ...item, originalQty: 0, newQty: item.qty }));

  const title = isReadOnly ? 'Thông tin đơn' : isEditing ? 'Chỉnh sửa đơn' : 'Xác nhận đơn';
  const grandTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={title}
        Icon={isReadOnly ? Info : CheckCircle2}
        backUrl={paths.orders.selectMenu}
      />

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">Thông tin chung</div>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex justify-between items-center">
              <span className="text-(--color-text-main)">Bàn phục vụ</span>
              <span className="text-(--color-text-secondary)">
                {table?.name || 'Mang về'}
              </span>
            </div>

            {cart.length > 0 && (
              <>
                {isEditing && !isReadOnly ? (
                  <>
                    {newItems.length > 0 && (
                      <>
                        <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">Món mới thêm</div>
                        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                          {newItems.map((item, idx) => (
                            <div key={idx} className="px-4 py-3 flex justify-between items-center">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-(--color-text-secondary)">{item.newQty}x</span>
                                  <span className="text-(--color-text-main) truncate">{item.name}</span>
                                </div>
                                <span className="text-[11px] text-(--color-text-secondary)">
                                  {startSt}
                                </span>
                              </div>
                              <span className="text-(--color-text-secondary) tabular-nums">
                                {formatMoney(item.price * item.newQty)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {oldItems.length > 0 && (
                      <>
                        <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">Món đang phục vụ</div>
                        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                          {oldItems.map((item, idx) => (
                            <div key={idx} className="px-4 py-3 flex justify-between items-center">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-(--color-text-secondary)">{item.oldQty}x</span>
                                  <span className="text-(--color-text-main) truncate">{item.name}</span>
                                </div>
                                <span className="text-[11px] text-(--color-text-secondary)">
                                  {item.status}
                                </span>
                              </div>
                              <span className="text-(--color-text-secondary) tabular-nums">
                                {formatMoney(item.price * item.oldQty)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="p-4 pb-2 font-semibold text-(--color-text-secondary)">Danh sách món</div>
                    <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                      {(() => {
                        const grouped = cart.reduce((acc, item) => {
                          const key = `${item.id}-${item.status}`;
                          if (acc[key]) {
                            acc[key].qty += item.qty;
                          } else {
                            acc[key] = { ...item };
                          }
                          return acc;
                        }, {} as Record<string, any>);

                        return Object.values(grouped)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="px-4 py-3 flex justify-between items-center">
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-(--color-text-secondary)">{item.qty}x</span>
                                  <span className="text-(--color-text-main) truncate">{item.name}</span>
                                </div>
                                <span className="text-[11px] text-(--color-text-secondary)">
                                  {item.status}
                                </span>
                              </div>
                              <span className="text-(--color-text-secondary) tabular-nums">
                                {formatMoney(item.price * item.qty)}
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-(--color-bg-surface) border-t border-(--color-border-main)">
        <div className="px-4 py-4 flex justify-between items-center">
          <span className="font-bold text-(--color-text-main)">Tổng cộng</span>
          <span className="text-2xl font-bold text-(--color-success) tabular-nums">
            {formatMoney(grandTotal)}
          </span>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-(--color-primary) text-(--color-bg-surface) py-4 text-center font-bold text-lg"
          >
            {isEditing ? 'Cập nhật' : 'Xác nhận'}
          </button>
        )}
      </div>
    </div>
  );
};
