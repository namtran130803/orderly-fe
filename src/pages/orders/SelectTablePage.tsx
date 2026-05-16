import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PackageSearch, ChevronRight, Grid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { useSwipeTabs } from '@/hooks/useSwipeTabs';
import { cn } from '@/lib/cn';
import { areaService, tableService } from '@/services/area.service';
import { useStoreStore } from '@/stores/store.store';
import { useOrderStore } from '@/stores/order.store';

export const SelectTablePage: React.FC = () => {
  const navigate = useNavigate();
  const storeId = useStoreStore((s) => s.store?.id);
  const setTable = useOrderStore((s) => s.setTable);
  const [searchParams, setSearchParams] = useSearchParams();
  const areaParam = searchParams.get('areaId');
  const selectedAreaId = areaParam ? Number(areaParam) : null;

  const { data: areas = [], isLoading: isAreasLoading } = useQuery({
    queryKey: ['areas', storeId],
    queryFn: async () => {
      const res = await areaService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { data: allTables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables', storeId],
    queryFn: async () => {
      const res = await tableService.list(storeId!);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const tablesByArea = useMemo(() => {
    return allTables.reduce((acc: Record<number, typeof allTables>, t) => {
      if (!acc[t.areaId]) acc[t.areaId] = [];
      acc[t.areaId].push(t);
      return acc;
    }, {});
  }, [allTables]);

  const setAreaId = (id: number) => {
    setSearchParams({ areaId: String(id) }, { replace: true });
  };

  const currentArea = areas.find((a) => a.id === selectedAreaId) || areas[0];
  const filteredTables = currentArea ? tablesByArea[currentArea.id] || [] : [];

  const hasMultipleAreas = areas.length > 1;
  const swipeHandlers = useSwipeTabs({
    items: areas,
    currentId: selectedAreaId,
    setCurrentId: setAreaId,
    enabled: hasMultipleAreas,
  });

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

  const handleTableClick = (table: { id: number; name: string; orderId?: number | null } | null) => {
    useOrderStore.getState().clearCart();
    setTable(table);
    useOrderStore.getState().setEditingOrder(table?.orderId || null);
    navigate(paths.orders.selectMenu);
  };

  const isLoading = isAreasLoading || isTablesLoading;

  return (
    <div className="flex-1 flex flex-col relative">
      {isLoading && <LoadingOverlay />}
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

      <div className="flex-1 relative" {...swipeHandlers}>
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
