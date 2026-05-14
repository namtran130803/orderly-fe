import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Activity, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/config/paths';

export const ReorderStatusesPage: React.FC = () => {
  const navigate = useNavigate();

  const statuses = [
    { id: 1, name: 'Chờ xử lý', type: 'start' },
    { id: 2, name: 'Đang chuẩn bị', type: 'mid' },
    { id: 3, name: 'Đang nướng', type: 'mid' },
    { id: 4, name: 'Đang trang trí', type: 'mid' },
    { id: 5, name: 'Kiểm tra chất lượng', type: 'mid' },
    { id: 6, name: 'Hoàn thành', type: 'end' },
  ];

  const [reorderList, setReorderList] = useState<any[]>([]);

  useEffect(() => {
    const midStatuses = statuses.filter((s) => s.type === 'mid');
    setReorderList(midStatuses);
  }, []);

  const handleMoveStatus = async (index: number, direction: 'up' | 'down') => {
    const newList = [...reorderList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setReorderList(newList);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Sắp xếp trạng thái"
        Icon={Activity}
        backUrl={paths.statuses.index}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-(--color-primary)"
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
