import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Grid, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { areaService, type Area } from '@/services/area.service';
import { useStoreStore } from '@/stores/store.store';

export const ReorderAreasPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { data: areas = [], isLoading: isAreasLoading } = useQuery({
    queryKey: ['areas', storeId],
    queryFn: async () => {
      const res = await areaService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const [reorderList, setReorderList] = useState<Area[]>([]);

  useEffect(() => {
    if (areas.length > 0) {
      setReorderList(areas);
    }
  }, [areas]);

  const { mutate: reorder, isPending: isReordering } = useMutation({
    mutationFn: (ids: number[]) => areaService.reorder(storeId!, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas', storeId] });
      navigateBackOrTo(navigate, paths.areas.index);
    },
  });

  const isPending = isAreasLoading || isReordering;

  const handleMoveArea = (index: number, direction: 'up' | 'down') => {
    const newList = [...reorderList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setReorderList(newList);
  };

  const handleSave = () => {
    reorder(reorderList.map((a) => a.id));
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header
        title="Sắp xếp khu vực"
        Icon={Grid}
        backUrl={paths.areas.index}
      >
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <p className="p-4 pb-2 text-sm text-(--color-text-secondary)">
              Dùng các nút lên/xuống để thay đổi thứ tự khu vực.
            </p>

            <div className="space-y-2">
              {reorderList.map((area, index) => (
                <div
                  key={area.id}
                  className="px-4 py-3 flex items-center justify-between bg-(--color-bg-surface)"
                >
                  <span className="font-medium">{area.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveArea(index, 'up')}
                      className="p-2 rounded-full bg-(--color-bg-main) text-(--color-primary) disabled:opacity-40"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button
                      disabled={index === reorderList.length - 1}
                      onClick={() => handleMoveArea(index, 'down')}
                      className="p-2 rounded-full bg-(--color-bg-main) text-(--color-primary) disabled:opacity-40"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
