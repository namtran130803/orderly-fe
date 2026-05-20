---
name: add-page
description: Use when creating new page components under src/pages/. Includes list pages (with infinite scroll), form pages (create/edit), and special pages. Follows project conventions.
---

# Page Patterns

Pages live in `src/pages/<feature>/` directories. Each page is a named export (no default exports).

## List page pattern

Uses `useInfiniteQuery` for cursor-based pagination + `useMutation` for delete.

```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Pencil, CirclePlus, Loader } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { paths } from '@/config/paths';
import { xService, type X } from '@/services/x.service';
import { useStoreStore } from '@/stores/store.store';

export const XPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['xs', storeId],
      queryFn: async ({ pageParam }) => {
        const res = await xService.list(storeId!, { limit: 20, cursor: pageParam });
        return res.data.data;
      },
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!storeId,
    });

  const items = data?.pages.flatMap((page) => page.items) || [];

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => xService.remove(storeId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xs', storeId] });
      setDeleteTarget(null);
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<X | null>(null);

  return (
    <div className="flex-1 flex flex-col relative">
      {(isLoading || isDeleting) && <LoadingOverlay />}
      <Header Icon={SomeIcon} title="Tên màn hình">
        <Link to={paths.xs.create} className="text-(--color-primary)">
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {/* Empty state */}
            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <SomeIcon size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có dữ liệu</p>
              </div>
            )}

            {/* List items */}
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link to={paths.xs.edit(item.id)} state={{ item }} className="text-(--color-warning)">
                      <Pencil size={20} />
                    </Link>
                    <button onClick={() => setDeleteTarget(item)} className="text-(--color-danger)">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader size={20} className="animate-spin text-(--color-primary)" />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={`Xóa ${deleteTarget?.name}`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => { if (deleteTarget) deleteItem(deleteTarget.id); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
```

## Form page pattern (create/edit)

Uses `Props = { type: 'create' | 'edit' }`, React Hook Form + Zod resolver, and `navigateBackOrTo` for back navigation.

```typescript
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { xService } from '@/services/x.service';
import { useStoreStore } from '@/stores/store.store';
import { createXResolver, type CreateXDto } from '@/schemas/x.schema';

type Props = { type: 'create' | 'edit' };

export const XFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const existing = location.state?.x;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateXDto) =>
      type === 'create'
        ? xService.create(storeId!, data)
        : xService.update(storeId!, existing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xs', storeId] });
      navigateBackOrTo(navigate, paths.xs.index);
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateXDto>({
    resolver: createXResolver,
    defaultValues: {
      name: existing?.name || '',
    },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header Icon={SomeIcon} title={type === 'create' ? 'Thêm mới' : 'Sửa'} backUrl={paths.xs.index}>
        <button type="submit" form="x-form" disabled={isPending} className="text-(--color-primary) disabled:opacity-50">
          <CheckCircle size={24} />
        </button>
      </Header>
      <form id="x-form" onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên</span>
            <input autoFocus placeholder="Nhập tên..." {...register('name')} className="flex-1 text-right" />
          </div>
        </div>
      </form>
    </div>
  );
};
```

## Route registration

In `src/App.tsx`, add the import and route under the `MainLayout` children:

```typescript
{
  path: paths.xs.index,
  element: <XPage />
},
{
  path: paths.xs.create,
  element: <XFormPage type="create" />
},
{
  path: paths.xs.edit(":id"),
  element: <XFormPage type="edit" />
},
```

Also add paths in `src/config/paths.ts`:

```typescript
xs: {
  index: '/xs',
  create: '/xs/create',
  edit: (id: string | number) => `/xs/${id}/edit`,
},
```
