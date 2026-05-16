import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { tableService } from '@/services/area.service';
import { useStoreStore } from '@/stores/store.store';
import { updateTableResolver, type UpdateTableDto } from '@/schemas/table.schema';

type Props = {
  type: 'create' | 'edit'
}

export const TablesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const table = location.state?.table;

  useEffect(() => {
    if (!table) {
      navigate(paths.areas.index, { replace: true });
    }
  }, [table, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateTableDto) =>
      tableService.update(storeId!, table.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', storeId] });
      navigate(paths.areas.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTableDto>({
    resolver: updateTableResolver,
    defaultValues: {
      name: table?.name || '',
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
        title={type === 'create' ? 'Thêm Bàn' : 'Sửa Tên Bàn'}
        Icon={Grid}
        backUrl={paths.areas.index}
      >
        <button
          type="submit"
          form="table-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="table-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên bàn</span>
            <input
              autoFocus
              placeholder="Bàn 1..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
