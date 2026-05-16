import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { statusService } from '@/services/status.service';
import { useStoreStore } from '@/stores/store.store';
import { createStatusResolver, type CreateStatusDto } from '@/schemas/status.schema';

type Props = {
  type: 'create' | 'edit'
}

export const StatusesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const status = location.state?.status;

  useEffect(() => {
    if (type === 'edit' && !status) {
      navigate(paths.statuses.index, { replace: true });
    }
  }, [type, status, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateStatusDto) =>
      type === 'create'
        ? statusService.create(storeId!, data)
        : statusService.update(storeId!, status.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', storeId] });
      navigate(paths.statuses.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStatusDto>({
    resolver: createStatusResolver,
    defaultValues: {
      name: status?.name || '',
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
        title={type === 'create' ? 'Thêm Trạng Thái' : 'Sửa Trạng Thái'}
        Icon={Activity}
        backUrl={paths.statuses.index}
      >
        <button
          type="submit"
          form="status-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="status-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên trạng thái</span>
            <input
              autoFocus
              placeholder="Pha chế..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
