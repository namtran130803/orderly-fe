import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Store as StoreIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { storeService } from '@/services/store.service';
import { useStoreStore } from '@/stores/store.store';
import { createStoreResolver, type CreateStoreDto } from '@/schemas/store.schema';

type Props = {
  type: 'create' | 'edit'
}

export const StoresFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setStore = useStoreStore((s) => s.setStore);
  const store = location.state?.store;

  useEffect(() => {
    if (type === 'edit' && !store) {
      navigate(paths.stores.index, { replace: true });
    }
  }, [type, store, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateStoreDto) =>
      type === 'create' ? storeService.create(data) : storeService.update(store?.id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      if (type === 'create') setStore(res.data.data);
      navigate(type === 'create' ? paths.overview.index : paths.stores.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStoreDto>({
    resolver: createStoreResolver,
    defaultValues: {
      name: store?.name || '',
      address: store?.address || '',
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
        title={type === 'create' ? 'Thêm Cửa Hàng' : 'Sửa Cửa Hàng'}
        Icon={StoreIcon}
        backUrl={paths.stores.index}
      >
        <button
          type="submit"
          form="store-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="store-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên quán</span>
            <input
              autoFocus
              placeholder="Orderly Cafe..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Địa chỉ</span>
            <input
              placeholder="Cầu giấy..."
              {...register('address')}
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
