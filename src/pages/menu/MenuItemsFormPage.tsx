import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { categoryService } from '@/services/category.service';
import { menuItemService } from '@/services/menu-item.service';
import { useStoreStore } from '@/stores/store.store';
import { createMenuItemResolver, type CreateMenuItemDto } from '@/schemas/menu-item.schema';
import { digitsFromMoneyInput, formatMoneyInputDisplay } from '@/utils/moneyInput';

type Props = {
  type: 'create' | 'edit'
}

export const MenuItemsFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const item = location.state?.item;

  useEffect(() => {
    if (type === 'edit' && !item) {
      navigate(paths.menu.index, { replace: true });
    }
  }, [type, item, navigate]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const res = await categoryService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateMenuItemDto) =>
      type === 'create'
        ? menuItemService.create(storeId!, data)
        : menuItemService.update(storeId!, item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', storeId] });
      navigateBackOrTo(navigate, paths.menu.index);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMenuItemDto>({
    resolver: createMenuItemResolver,
    defaultValues: {
      name: item?.name || '',
      price: item?.price || 0,
      categoryId: item?.categoryId || location.state?.categoryId || 0,
    },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header
        title={`${type === 'edit' ? 'Sửa' : 'Thêm'} Món Ăn`}
        Icon={BookOpen}
        backUrl={paths.menu.index}
      >
        <button
          type="submit"
          form="menu-item-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="menu-item-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên món</span>
            <input
              autoFocus
              placeholder="Cà phê đen..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Giá bán</span>
            <Controller
              name="price"
              control={control}
              render={({ field }) => {
                const digits =
                  field.value === undefined ||
                  field.value === null ||
                  Number(field.value) === 0
                    ? ''
                    : String(Math.trunc(Number(field.value)));
                return (
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    className="flex-1 text-right tabular-nums"
                    value={formatMoneyInputDisplay(digitsFromMoneyInput(digits))}
                    onChange={(e) => {
                      const d = digitsFromMoneyInput(e.target.value);
                      field.onChange(d === '' ? 0 : Number(d));
                    }}
                    onBlur={field.onBlur}
                  />
                );
              }}
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Danh mục</span>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="flex-1 text-right"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};
