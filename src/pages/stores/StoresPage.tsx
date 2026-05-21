import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Pencil, Store as StoreIcon, CirclePlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { PERMS } from "@/config/perms";
import { cn } from "@/lib/cn";
import { storeService } from "@/services/store.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { clearStore as clearStoreContext } from "@/stores/clear";

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setStore = useStoreStore((s) => s.setStore);
  const currentStore = useStoreStore((s) => s.store);
  const canCreate = usePerm(PERMS.stores.update);
  const canUpdate = usePerm(PERMS.stores.update);
  const canDelete = usePerm(PERMS.stores.delete);
  const [deleteTarget, setDeleteTarget] = useState<
    (typeof stores)[number] | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await storeService.list();
      return res.data.data;
    },
  });

  const stores = data || [];

  // Auto-select store if only one exists
  useEffect(() => {
    if (!isLoading && stores.length === 1 && !currentStore) {
      setStore(stores[0]);
      navigate(paths.settings.index, { replace: true });
    }
  }, [stores, currentStore, isLoading, setStore, navigate]);

  const { mutate: deleteStore, isPending: isDeleting } = useMutation({
    mutationFn: (storeId: number) => storeService.remove(storeId),
    onSuccess: async (_, storeId) => {
      const updatedStores = stores.filter((s) => s.id !== storeId);
      if (updatedStores.length > 0) {
        const deletedIndex = stores.findIndex((s) => s.id === storeId);
        const nextIndex =
          deletedIndex < updatedStores.length
            ? deletedIndex
            : updatedStores.length - 1;

        clearStoreContext();
        setStore(updatedStores[nextIndex]);
        queryClient.setQueryData(["stores"], updatedStores);
      } else {
        clearStoreContext();
        queryClient.setQueryData(["stores"], []);
        navigate(paths.stores.index, { replace: true });
      }
    },
  });

  const handleSelect = (st: (typeof stores)[number]) => {
    clearStoreContext();
    setStore(st);
    navigate(paths.settings.index, { replace: true });
  };

  const handleDelete = (st: (typeof stores)[number]) => {
    setDeleteTarget(st);
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {(isLoading || isDeleting) && <LoadingOverlay />}
      <Header Icon={StoreIcon} title="Cửa hàng" backUrl={paths.settings.index}>
        <Link to={paths.stores.create} className="text-(--color-primary)">
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!currentStore && stores.length > 0 && (
              <p className="p-4 pb-2 text-(--color-text-secondary)">
                Chọn cửa hàng để bắt đầu
              </p>
            )}

            {!currentStore && stores.length < 1 && canCreate && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-(--color-bg-surface) my-4 border-y border-(--color-border-main)">
                <h2 className="text-lg font-semibold text-(--color-text-main) mb-2">
                  Bắt đầu với Orderly
                </h2>
                <p className="text-sm text-(--color-text-secondary) mb-6 max-w-64">
                  Tạo cửa hàng đầu tiên của bạn để bắt đầu quản lý
                </p>
                <Link
                  to={paths.stores.create}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-(--color-primary) text-(--color-bg-surface) rounded-lg font-medium"
                >
                  <CirclePlus size={20} />
                  Tạo cửa hàng
                </Link>
              </div>
            )}

            {stores.length > 0 && (
              <div
                className={cn(
                  "bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)",
                  currentStore ? "mt-4" : "mt-0",
                )}
              >
                {stores.map((st) => {
                  const isSelected = currentStore?.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleSelect(st)}
                      className="px-4 py-3 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col justify-start items-start gap-1">
                            <p
                              className={cn(
                                "font-medium truncate",
                                isSelected && "text-(--color-primary)",
                              )}
                            >
                              {st.name}
                            </p>
                            {st.address && (
                              <p className="text-xs text-(--color-text-secondary) mt-0.5 truncate">
                                {st.address}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {st.roleName && st.roleName.length > 0 ? (
                                st.roleName.map((role) => (
                                  <span
                                    key={role}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {role}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all bg-emerald-50 text-emerald-700 border-emerald-200">
                                  Chủ cửa hàng
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {isSelected && canUpdate && (
                          <Link
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            to={paths.stores.edit(st.id)}
                            state={{ store: st }}
                            className="text-(--color-warning)"
                          >
                            <Pencil size={20} />
                          </Link>
                        )}

                        {isSelected &&
                          canDelete &&
                          (!st.roleName || st.roleName.length === 0) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(st);
                              }}
                              className="text-(--color-danger)"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
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
        onConfirm={() => {
          if (deleteTarget) deleteStore(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
