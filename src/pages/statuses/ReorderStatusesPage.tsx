import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Activity, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { statusService, STATUS_TYPE, type Status } from '@/services/status.service';
import { useStoreStore } from '@/stores/store.store';

export const ReorderStatusesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { data: statuses = [], isLoading: isStatusesLoading } = useQuery({
    queryKey: ['statuses', storeId],
    queryFn: async () => {
      const res = await statusService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const [reorderList, setReorderList] = useState<Status[]>([]);

  useEffect(() => {
    const mids = statuses.filter((s) => s.type === STATUS_TYPE.MID);
    setReorderList(mids);
  }, [statuses]);

  const { mutate: reorder, isPending: isReordering } = useMutation({
    mutationFn: (ids: number[]) => statusService.reorder(storeId!, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', storeId] });
      navigate(paths.statuses.index);
    },
  });

  const isPending = isStatusesLoading || isReordering;

  const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
    const newList = [...reorderList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setReorderList(newList);
  };

  const handleSave = () => {
    reorder(reorderList.map((s) => s.id));
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {isPending && <LoadingOverlay />}
      <Header
        title="Sắp xếp trạng thái"
        Icon={Activity}
        backUrl={paths.statuses.index}
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
            <p className="p-4 pb-2 text-(--color-text-secondary)">
              Dùng các nút lên/xuống để thay đổi thứ tự trạng thái trung gian.
            </p>

            <div className="space-y-2">
              {reorderList.map((status, index) => (
                <div
                  key={status.id}
                  className="px-4 py-3 flex items-center justify-between bg-(--color-bg-surface)"
                >
                  <span className="font-medium">{status.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveStatus(index, 'up')}
                      className="p-2 rounded-full bg-(--color-bg-main) text-(--color-primary) disabled:opacity-40"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button
                      disabled={index === reorderList.length - 1}
                      onClick={() => handleMoveStatus(index, 'down')}
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
