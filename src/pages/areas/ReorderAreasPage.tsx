import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Grid, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/config/paths';

export const ReorderAreasPage: React.FC = () => {
  const navigate = useNavigate();

  const areas = [
    { id: 1, name: 'Tầng 1 - Trong nhà', tableCount: 6 },
    { id: 2, name: 'Tầng 2 - Ban công', tableCount: 4 },
  ];

  const [reorderList, setReorderList] = useState<any[]>([]);

  useEffect(() => {
    setReorderList(areas);
  }, []);

  const handleMoveArea = async (index: number, direction: 'up' | 'down') => {
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
        title="Sắp xếp khu vực"
        Icon={Grid}
        backUrl={paths.areas.index}
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
