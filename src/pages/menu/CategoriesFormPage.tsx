import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { categoryService } from '@/services/category.service';
import { useStoreStore } from '@/stores/store.store';
import { createCategoryResolver, type CreateCategoryDto } from '@/schemas/category.schema';

type Props = {
  type: 'create' | 'edit'
}

export const CategoriesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const category = location.state?.category;

  useEffect(() => {
    if (type === 'edit' && !category) {
      navigate(paths.menu.index, { replace: true });
    }
  }, [type, category, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateCategoryDto) =>
      type === 'create'
        ? categoryService.create(storeId!, data)
        : categoryService.update(storeId!, category.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      navigate(paths.menu.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryDto>({
    resolver: createCategoryResolver,
    defaultValues: {
      name: category?.name || '',
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
        title={type === 'create' ? 'Thêm Danh Mục' : 'Sửa Danh Mục'}
        Icon={BookOpen}
        backUrl={paths.menu.index}
      >
        <button
          type="submit"
          form="category-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form id="category-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên danh mục</span>
            <input
              autoFocus
              placeholder="Cà phê..."
              {...register('name')}
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
