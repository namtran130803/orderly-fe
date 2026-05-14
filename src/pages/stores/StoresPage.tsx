import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Pencil, Store as StoreIcon, CirclePlus } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();

  const stores = [
    { id: 1, name: 'Quán nướng cô Miu', address: 'Cổ nhuế' },
    { id: 2, name: 'Cà phê ông Tùng', address: 'Cầu Giấy' },
  ];

  const [selectedStore, setSelectedStore] = useState<any>(stores[0]);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        Icon={StoreIcon}
        title="Cửa hàng"
        backUrl={paths.settings.index}
      >
        <Link
          to={paths.stores.create}
          className="text-(--color-primary)"
        >
          <CirclePlus size={24} />
        </Link>
      </Header>

      <div className='flex-1 relative'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 overflow-auto pb-4'>

            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {stores.map((st) => {
                const isSelected = selectedStore?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStore(st)}
                    className="px-4 py-3 w-full flex items-center justify-between gap-2 active:opacity-100"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col justify-start items-start gap-1">
                          <p
                            className={cn('font-medium truncate', isSelected && 'text-(--color-primary)')}
                          >
                            {st.name}
                          </p>
                          <p className="text-xs text-(--color-text-secondary) mt-0.5 truncate">
                            {st.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-4"
                    >
                      <Link
                        to={paths.stores.edit(st.id)}
                        className="text-(--color-warning)"
                      >
                        <Pencil size={20} />
                      </Link>

                      {stores.length > 1 && (
                        <button
                          className="text-(--color-danger)"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
