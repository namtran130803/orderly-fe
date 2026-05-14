import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PackageSearch, ChevronRight, Grid } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

export const SelectTablePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const areaParam = searchParams.get('areaId');
  const selectedAreaId = areaParam ? Number(areaParam) : null;

  const setAreaId = (id: number) => {
    setSearchParams({ areaId: String(id) }, { replace: true });
  };

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

  const currentArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const filteredTables = tables
    .filter((t) => t.areaId === currentArea?.id)
    .map((t) => ({ ...t, areaName: currentArea?.name }));

  const hasMultipleAreas = areas.length > 1;

  const scrollTabIntoView = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  };

  useEffect(() => {
    if (currentArea) {
      scrollTabIntoView(`area-tab-${currentArea.id}`);
      if (!areaParam) {
        setAreaId(currentArea.id);
      }
    }
  }, [currentArea, areaParam]);

  const handleTableClick = (_t: any) => {
    navigate(paths.orders.selectMenu, { state: { stepCount: (location.state?.stepCount || 1) + 1 } });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Chọn bàn"
        Icon={Grid}
        backUrl={paths.orders.index}
      />

      {hasMultipleAreas && (
        <div className="bg-(--color-bg-surface) flex border-b border-(--color-border-main) overflow-x-auto shrink-0">
          {areas.map((area) => (
            <button
              key={area.id}
              id={`area-tab-${area.id}`}
              onClick={() => setAreaId(area.id)}
              className={cn(
                'px-4 py-2 text-sm whitespace-nowrap font-medium border-b-2 flex items-center gap-2',
                currentArea?.id === area.id && 'border-(--color-primary) text-(--color-primary)',
                currentArea?.id !== area.id && 'border-transparent text-(--color-text-secondary)',
              )}
            >
              {area.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main)">
              <button
                onClick={() => handleTableClick(null)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center">
                    <PackageSearch size={18} />
                  </div>
                  <span className="text-(--color-text-main)">Mang về</span>
                </div>
                <ChevronRight size={20} className="text-(--color-text-placeholder)" />
              </button>
            </div>

            <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {filteredTables.map((t) => {
                const isServing = t.orderId !== null;

                return (
                  <button
                    key={t.id}
                    onClick={() => handleTableClick(t)}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-(--color-text-main)">{t.name}</span>
                      {isServing && (
                        <span className="text-[10px] bg-(--color-warning) text-(--color-bg-surface) px-1.5 py-0.5 rounded font-medium">
                          Gọi thêm
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-(--color-text-muted)">{t.areaName}</span>
                      <ChevronRight size={20} className="text-(--color-text-placeholder)" />
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
