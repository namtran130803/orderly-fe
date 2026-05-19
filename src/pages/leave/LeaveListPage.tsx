import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { leaveService } from '@/services/leave.service';
import { useStoreStore } from '@/stores/store.store';

const ST: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const LeaveListPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);

  const { data, isLoading } = useQuery({
    queryKey: ['leaves', storeId],
    queryFn: async () => {
      const res = await leaveService.list(storeId!);
      return res.data.data as any[];
    },
    enabled: !!storeId,
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header title="Nghỉ phép" Icon={Palmtree} backUrl={paths.settings.index} />

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {!isLoading && data?.length === 0 && (
                <div className="py-8 text-center text-sm text-(--color-text-muted)">
                  Chưa có đơn nghỉ
                </div>
              )}
              {data?.map((row: any) => (
                <Link
                  key={row.id}
                  to={paths.leave.detail(row.id)}
                  state={{ row }}
                  className="px-4 py-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {row.employee?.user?.name}
                    </div>
                    <div className="text-xs text-(--color-text-secondary)">
                      {row.fromDate?.slice?.(0, 10)} → {row.toDate?.slice?.(0, 10)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-(--color-text-secondary)">
                      {ST[row.status] ?? row.status}
                    </span>
                    <ChevronRight size={18} className="text-(--color-text-placeholder)" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
