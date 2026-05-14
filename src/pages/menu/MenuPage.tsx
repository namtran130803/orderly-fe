import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Pencil,
  BookOpen,
  CirclePlus,
  ArrowUpDown,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { formatMoney } from '@/utils/formatMoney';

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Cà phê' },
    { id: 2, name: 'Trà hoa quả' },
    { id: 3, name: 'Bánh ngọt' },
  ];

  const menuItems = [
    { id: 1, name: 'Cà phê Sữa đá', price: 29000, categoryId: 1 },
    { id: 2, name: 'Cà phê Đen đá', price: 25000, categoryId: 1 },
    { id: 3, name: 'Bạc xỉu', price: 32000, categoryId: 1 },

    { id: 4, name: 'Trà Đào Cam Sả', price: 39000, categoryId: 2 },
    { id: 5, name: 'Trà Vải Nhiệt Đới', price: 39000, categoryId: 2 },

    { id: 6, name: 'Bánh Mì Quế', price: 20000, categoryId: 3 },
    { id: 7, name: 'Croissant Phô Mai', price: 35000, categoryId: 3 },
  ];

  // gom nhóm món ăn theo danh mục
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }

    acc[item.categoryId].push(item);

    return acc;
  }, {} as Record<number, typeof menuItems>);


  return (
    <div className="flex-1 flex flex-col">
      <Header title="Thực đơn" Icon={BookOpen} backUrl={paths.settings.index}>
        <div className="flex items-center gap-4">
          {categories.length > 1 && (
            <Link
              to={paths.menu.categories.reorder}
              className="text-(--color-primary)"
            >
              <ArrowUpDown size={20} />
            </Link>
          )}

          <Link
            to={paths.menu.categories.create}
            className="text-(--color-primary)"
          >
            <CirclePlus size={24} />
          </Link>
        </div>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {categories.map((cat) => {
              const catItems = groupedMenuItems[cat.id] || [];

              return (
                <div key={cat.id}>
                  {/* category header */}
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span className="font-semibold text-(--color-text-secondary)">
                      {cat.name}
                    </span>

                    <div className="flex items-center gap-4">
                      <Link
                        to={paths.menu.items.create}
                        state={{
                          categoryId: cat.id,
                        }}
                        className="text-(--color-primary)"
                      >
                        <CirclePlus size={20} />
                      </Link>

                      <Link
                        to={paths.menu.categories.edit(cat.id)}
                        state={{
                          category: cat,
                        }}
                        className="text-(--color-warning)"
                      >
                        <Pencil size={20} />
                      </Link>

                      <button
                        className="text-(--color-danger)"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* items */}
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
                          <Link
                            to={paths.menu.items.edit(item.id)}
                            state={{
                              item,
                            }}
                            className="text-(--color-warning)"
                          >
                            <Pencil size={20} />
                          </Link>

                          <button
                            className="text-(--color-danger)"
                          >
                            <Trash2 size={20} />
                          </button>
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
    </div>
  );
};