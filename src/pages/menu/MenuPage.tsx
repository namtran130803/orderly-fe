import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Pencil,
  BookOpen,
  CirclePlus,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { formatMoney } from "@/utils/formatMoney";
import { categoryService, type Category } from "@/services/category.service";
import { menuItemService, type MenuItem } from "@/services/menu-item.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";

export const MenuPage: React.FC = () => {
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const canCategoriesCreate = usePerm(PERMS.categories.create);
  const canCategoriesUpdate = usePerm(PERMS.categories.update);
  const canCategoriesDelete = usePerm(PERMS.categories.delete);
  const canCategoriesReorder = usePerm(PERMS.categories.reorder);
  const canMenuItemsCreate = usePerm(PERMS.menu_items.create);
  const canMenuItemsUpdate = usePerm(PERMS.menu_items.update);
  const canMenuItemsDelete = usePerm(PERMS.menu_items.delete);
  const canAIMenu = usePerm(PERMS.ai.menu_analyze) || usePerm(PERMS.ai.menu_generate);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const res = await categoryService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: menuItems = [], isLoading: isMenuItemsLoading } = useQuery({
    queryKey: ["menu-items", storeId],
    queryFn: async () => {
      const res = await menuItemService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation(
    {
      mutationFn: (catId: number) => categoryService.remove(storeId!, catId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["categories", storeId] });
        queryClient.invalidateQueries({ queryKey: ["menu-items", storeId] });
      },
    },
  );

  const { mutate: deleteMenuItem, isPending: isDeletingItem } = useMutation({
    mutationFn: (itemId: number) => menuItemService.remove(storeId!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", storeId] });
    },
  });

  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItem | null>(
    null,
  );

  const groupedMenuItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = [];
      }
      acc[item.categoryId].push(item);
      return acc;
    },
    {} as Record<number, MenuItem[]>,
  );

  const isLoading = isCategoriesLoading || isMenuItemsLoading;
  const isPending = isLoading || isDeletingCategory || isDeletingItem;

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header title="Thực đơn" Icon={BookOpen} backUrl={paths.settings.index}>
        <div className="flex items-center gap-4">
          {canAIMenu && (
            <Link
              to={paths.menu.ai}
              className="text-(--color-primary)"
            >
              <Sparkles size={20} />
            </Link>
          )}

          {categories.length > 1 && canCategoriesReorder && (
            <Link
              to={paths.menu.categories.reorder}
              className="text-(--color-primary)"
            >
              <ArrowUpDown size={20} />
            </Link>
          )}

          {canCategoriesCreate && (
            <Link
              to={paths.menu.categories.create}
              className="text-(--color-primary)"
            >
              <CirclePlus size={24} />
            </Link>
          )}
        </div>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && categories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-(--color-text-muted)">
                <BookOpen size={48} className="mb-2 opacity-50" />
                <p className="text-sm">Không có thực đơn nào</p>
              </div>
            )}
            {categories.map((cat) => {
              const catItems = groupedMenuItems[cat.id] || [];

              return (
                <div key={cat.id}>
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span className="font-semibold text-(--color-text-secondary)">
                      {cat.name}
                    </span>

                    <div className="flex items-center gap-4">
                      {canMenuItemsCreate && (
                        <Link
                          to={paths.menu.items.create}
                          state={{
                            categoryId: cat.id,
                          }}
                          className="text-(--color-primary)"
                        >
                          <CirclePlus size={20} />
                        </Link>
                      )}

                      {canCategoriesUpdate && (
                        <Link
                          to={paths.menu.categories.edit(cat.id)}
                          state={{
                            category: cat,
                          }}
                          className="text-(--color-warning)"
                        >
                          <Pencil size={20} />
                        </Link>
                      )}

                      {canCategoriesDelete && (
                        <button
                          onClick={() => setDeleteCatTarget(cat)}
                          className="text-(--color-danger)"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex justify-between items-center gap-2"
                      >
                        <div className="flex-1">
                          <p className="text-(--color-text-main) truncate">
                            {item.name}
                          </p>

                          <p className="text-(--color-text-secondary) mt-0.5 tabular-nums">
                            {formatMoney(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {canMenuItemsUpdate && (
                            <Link
                              to={paths.menu.items.edit(item.id)}
                              state={{
                                item,
                              }}
                              className="text-(--color-warning)"
                            >
                              <Pencil size={20} />
                            </Link>
                          )}

                          {canMenuItemsDelete && (
                            <button
                              onClick={() => setDeleteItemTarget(item)}
                              className="text-(--color-danger)"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteCatTarget !== null}
        title={`Xóa ${deleteCatTarget?.name}`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteCatTarget) deleteCategory(deleteCatTarget.id);
          setDeleteCatTarget(null);
        }}
        onCancel={() => setDeleteCatTarget(null)}
      />

      <ConfirmDialog
        isOpen={deleteItemTarget !== null}
        title={`Xóa ${deleteItemTarget?.name}`}
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteItemTarget) deleteMenuItem(deleteItemTarget.id);
          setDeleteItemTarget(null);
        }}
        onCancel={() => setDeleteItemTarget(null)}
      />
    </div>
  );
};
