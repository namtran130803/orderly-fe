import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, BookOpen, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/config/paths';

export const CategoriesReorderPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Cà phê' },
    { id: 2, name: 'Trà hoa quả' },
    { id: 3, name: 'Bánh ngọt' },
  ];

  const [reorderList, setReorderList] = useState<any[]>([]);

  useEffect(() => {
    setReorderList(categories);
  }, []);

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
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
        title="Sắp xếp danh mục"
        Icon={BookOpen}
        backUrl={paths.menu.index}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-(--color-primary)"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <div className='flex-1 relative'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 overflow-auto pb-4'>
            <p className="p-4 pb-2 text-sm text-(--color-text-secondary)">
              Dùng các nút lên/xuống để thay đổi thứ tự danh mục.
            </p>

            <div className="space-y-2">
              {reorderList.map((category, index) => (
                <div
                  key={category.id}
                  className="px-4 py-3 flex items-center justify-between bg-(--color-bg-surface)"
                >
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveCategory(index, 'up')}
                      className="p-2 rounded-full bg-(--color-bg-main) text-(--color-primary) disabled:opacity-40"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button
                      disabled={index === reorderList.length - 1}
                      onClick={() => handleMoveCategory(index, 'down')}
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