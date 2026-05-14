import { Link } from 'react-router-dom';
import {
  Trash2,
  Pencil,
  Grid,
  CirclePlus,
  ArrowUpDown,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

export const AreasPage: React.FC = () => {
  const areas = [
    { id: 1, name: 'Tầng 1 - Trong nhà', tableCount: 6 },
    { id: 2, name: 'Tầng 2 - Ban công', tableCount: 4 },
  ];

  const tables = [
    { id: 1, name: 'Bàn 101', areaId: 1, isOccupied: true, orderId: 101 },
    { id: 2, name: 'Bàn 102', areaId: 1, isOccupied: false, orderId: null },
    { id: 3, name: 'Bàn 103', areaId: 1, isOccupied: false, orderId: null },
    { id: 4, name: 'Bàn 201', areaId: 2, isOccupied: true, orderId: 102 },
    { id: 5, name: 'Bàn 202', areaId: 2, isOccupied: false, orderId: null },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Khu vực & Bàn" Icon={Grid} backUrl={paths.settings.index}>
        <div className="flex items-center gap-4">
          {areas.length > 1 && (
            <Link
              to={paths.areas.reorder}
              className="text-(--color-primary)"
            >
              <ArrowUpDown size={20} />
            </Link>
          )}

          <Link
            to={paths.areas.create}
            className="text-(--color-primary)"
          >
            <CirclePlus size={24} />
          </Link>
        </div>
      </Header>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {areas.map((area) => {
              const areaTables = tables.filter((t) => t.areaId === area.id);

              return (
                <div key={area.id}>
                  {/* area header */}
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span className="font-semibold text-(--color-text-secondary)">
                      {area.name}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        className="text-(--color-primary)"
                      >
                        <CirclePlus size={20} />
                      </button>

                      <Link
                        to={paths.areas.edit(area.id)}
                        state={{
                          area,
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

                  {/* tables */}
                  <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                    {areaTables.map((t) => (
                      <div
                        key={t.id}
                        className="px-4 py-3 flex justify-between items-center gap-2"
                      >
                        <div className="flex-1">
                          <p className="text-(--color-text-main) truncate">
                            {t.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Link
                            to={paths.areas.tables.edit(t.id)}
                            state={{
                              table: t,
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
