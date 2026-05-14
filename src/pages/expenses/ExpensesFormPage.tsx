import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HandCoins, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

type Props = {
  type: 'create' | 'edit'
}

export const ExpensesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const expenseId = useParams().id;

  console.log(expenseId);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        Icon={HandCoins}
        title={type === 'create' ? 'Thêm chi tiêu' : 'Sửa chi tiêu'}
        backUrl={paths.expenses.index}
      >
        <button
          onClick={() => navigate(paths.expenses.index)}
          className="text-(--color-primary)"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tiêu đề</span>
            <input
              autoFocus
              className="flex-1 text-right"
              placeholder='Nhập hàng đầu tháng...'
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Số tiền</span>
            <input
              type="number"
              className="flex-1 text-right"
              placeholder='0'
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2 justify-between">
            <span className="font-medium">Thời gian</span>
            <label htmlFor="invoice-date-create" className="flex-1 text-right relative cursor-pointer block">
              13/05/2026
              <input
                id="invoice-date-create"
                type="date"
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch { }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
