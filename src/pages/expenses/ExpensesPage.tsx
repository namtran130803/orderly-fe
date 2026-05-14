import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Pencil, CirclePlus, HandCoins } from 'lucide-react';
import { Header } from '@/components/Header';
import { formatMoney } from '@/utils/formatMoney';
import { paths } from '@/config/paths';

export const ExpensesPage: React.FC = () => {
  interface IExpense {
    id: number;
    title: string;
    amount: number;
    rawDate: string;
  }

  const expenses = [
    {
      id: 1,
      title: 'Nhập thịt bò Mỹ',
      category: 'Nguyên liệu',
      amount: 3250000,
      rawDate: '2026-05-11',
    },
    {
      id: 2,
      title: 'Nhập xương hầm nước dùng',
      category: 'Nguyên liệu',
      amount: 1850000,
      rawDate: '2026-05-11',
    },
    {
      id: 3,
      title: 'Mua rau thơm và giá đỗ',
      category: 'Nguyên liệu',
      amount: 420000,
      rawDate: '2026-05-11',
    },
    {
      id: 4,
      title: 'Nhập bánh phở tươi',
      category: 'Nguyên liệu',
      amount: 780000,
      rawDate: '2026-05-11',
    },

    {
      id: 5,
      title: 'Mua ly nhựa và ống hút',
      category: 'Bao bì',
      amount: 560000,
      rawDate: '2026-05-12',
    },
    {
      id: 6,
      title: 'In tem logo cửa hàng',
      category: 'Bao bì',
      amount: 950000,
      rawDate: '2026-05-12',
    },
    {
      id: 7,
      title: 'Mua hộp mang về',
      category: 'Bao bì',
      amount: 1250000,
      rawDate: '2026-05-12',
    },

    {
      id: 8,
      title: 'Thanh toán tiền điện',
      category: 'Vận hành',
      amount: 2150000,
      rawDate: '2026-05-13',
    },
    {
      id: 9,
      title: 'Thanh toán tiền nước',
      category: 'Vận hành',
      amount: 680000,
      rawDate: '2026-05-13',
    },
    {
      id: 10,
      title: 'Thanh toán internet',
      category: 'Vận hành',
      amount: 320000,
      rawDate: '2026-05-13',
    },

    {
      id: 11,
      title: 'Lương nhân viên ca sáng',
      category: 'Nhân sự',
      amount: 2400000,
      rawDate: '2026-05-14',
    },
    {
      id: 12,
      title: 'Lương nhân viên ca tối',
      category: 'Nhân sự',
      amount: 2800000,
      rawDate: '2026-05-14',
    },

    {
      id: 13,
      title: 'Mua nước ngọt bổ sung',
      category: 'Đồ uống',
      amount: 1350000,
      rawDate: '2026-05-14',
    },
    {
      id: 14,
      title: 'Nhập đá viên',
      category: 'Đồ uống',
      amount: 180000,
      rawDate: '2026-05-14',
    },

    {
      id: 15,
      title: 'Bảo trì bếp gas',
      category: 'Thiết bị',
      amount: 750000,
      rawDate: '2026-05-15',
    },
    {
      id: 16,
      title: 'Mua chén đũa mới',
      category: 'Thiết bị',
      amount: 920000,
      rawDate: '2026-05-15',
    },

    {
      id: 17,
      title: 'Chi phí quảng cáo Facebook',
      category: 'Marketing',
      amount: 1500000,
      rawDate: '2026-05-15',
    },
    {
      id: 18,
      title: 'Thiết kế banner khai trương',
      category: 'Marketing',
      amount: 650000,
      rawDate: '2026-05-15',
    },

    {
      id: 19,
      title: 'Thuê ship giao hàng giờ cao điểm',
      category: 'Vận chuyển',
      amount: 430000,
      rawDate: '2026-05-16',
    },
    {
      id: 20,
      title: 'Mua khăn giấy',
      category: 'Tiêu hao',
      amount: 210000,
      rawDate: '2026-05-16',
    },
    {
      id: 21,
      title: 'Mua nước rửa chén',
      category: 'Tiêu hao',
      amount: 145000,
      rawDate: '2026-05-16',
    },
  ];

  // Gom nhóm danh sách hóa đơn theo ngày
  const groupedExpenses = expenses.reduce((acc: Record<string, IExpense[]>, expense: IExpense) => {
    if (!acc[expense.rawDate]) acc[expense.rawDate] = [];
    acc[expense.rawDate].push(expense);
    return acc;
  }, {});

  const groupDates = Object.keys(groupedExpenses);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        Icon={HandCoins}
        title="Chi tiêu"
      >
        <Link to={paths.expenses.create}
          className="text-(--color-primary)"
        >
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className='flex-1 relative'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 overflow-auto pb-4'>
            {groupDates.map((dateKey) => (
              <div key={dateKey}>
                {/* Section Header ngày */}
                <div className="sticky top-0 z-10 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
                  <h3 className="text-sm font-semibold text-(--color-text-secondary) p-4 pb-2">
                    {new Date(dateKey).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                </div>

                {/* Danh sách items của ngày */}
                <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                  {groupedExpenses[dateKey].map((expense) => (
                    <div key={expense.id} className="px-4 py-3 flex items-center justify-between gap-2">

                      {/* Tiêu đề && Số tiền */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h4 className="font-medium truncate">
                          {expense.title}
                        </h4>
                        <span className="text-(--color-danger) font-medium">
                          {formatMoney(expense.amount)}
                        </span>
                      </div>

                      {/* Nút chỉnh sửa && nút xóa */}
                      <div className="flex items-center gap-4">
                        <Link to={paths.expenses.edit(expense.id)}
                          className="text-(--color-warning)"
                        >
                          <Pencil size={20} />
                        </Link>
                        <button
                          className="text-(--color-danger)"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
