import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { areaService } from '@/services/area.service';
import { useStoreStore } from '@/stores/store.store';
import { createAreaResolver, type CreateAreaDto } from '@/schemas/area.schema';

type Props = {
  type: 'create' | 'edit'
}

export const AreasFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const area = location.state?.area;

  useEffect(() => {
    if (type === 'edit' && !area) {
      navigate(paths.areas.index, { replace: true });
    }
  }, [type, area, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateAreaDto) =>
      type === 'create'
        ? areaService.create(storeId!, data)
        : areaService.update(storeId!, area.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', storeId] });
      queryClient.invalidateQueries({ queryKey: ['tables', storeId] });
      navigateBackOrTo(navigate, paths.areas.index);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAreaDto>({
    resolver: createAreaResolver,
    defaultValues: {
      name: area?.name || '',
      tableCount: type === 'edit' ? (location.state?.tableCount || 0) : 0,
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
        title={type === 'create' ? 'Thêm Khu Vực' : 'Sửa Khu Vực'}
        Icon={Grid}
        backUrl={paths.areas.index}
      >
        <button
          type="submit"
          form="area-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="area-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên khu vực</span>
            <input
              autoFocus
              placeholder="Tầng 1..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Số lượng bàn</span>
            <input
              type="number"
              placeholder="10"
              {...register('tableCount', { valueAsNumber: true })}
              className="flex-1 text-right tabular-nums"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
