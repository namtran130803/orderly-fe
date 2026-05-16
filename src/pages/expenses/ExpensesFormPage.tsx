import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { HandCoins, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { expenseService } from '@/services/expense.service';
import { useStoreStore } from '@/stores/store.store';
import { createExpenseResolver, type CreateExpenseDto } from '@/schemas/expense.schema';

type Props = {
  type: 'create' | 'edit'
}

export const ExpensesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const expense = location.state?.expense;

  useEffect(() => {
    if (type === 'edit' && !expense) {
      navigate(paths.expenses.index, { replace: true });
    }
  }, [type, expense, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateExpenseDto) =>
      type === 'create'
        ? expenseService.create(storeId!, data)
        : expenseService.update(storeId!, expense.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', storeId] });
      navigate(paths.expenses.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseDto>({
    resolver: createExpenseResolver,
    defaultValues: {
      title: expense?.title || '',
      amount: expense?.amount || 0,
      rawDate: expense
        ? expense.rawDate.split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const watchRawDate = watch('rawDate');

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('vi-VN', {
      day: 'numeric', month: 'numeric', year: 'numeric',
    });
  };

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header
        Icon={HandCoins}
        title={type === 'create' ? 'Thêm chi tiêu' : 'Sửa chi tiêu'}
        backUrl={paths.expenses.index}
      >
        <button
          type="submit"
          form="expense-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="expense-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tiêu đề</span>
            <input
              autoFocus
              placeholder="Nhập hàng đầu tháng..."
              {...register('title')}
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Số tiền</span>
            <input
              type="number"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className="flex-1 text-right tabular-nums"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2 justify-between">
            <span className="font-medium">Thời gian</span>
            <label className="flex-1 text-right relative cursor-pointer block">
              <span>{watchRawDate ? formatDate(watchRawDate) : 'Chọn ngày'}</span>
              <input
                type="date"
                onClick={(e) => {
                  try { e.currentTarget.showPicker?.(); } catch { }
                }}
                {...register('rawDate')}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
