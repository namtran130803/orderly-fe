import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CalendarCheck2, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { attendanceService } from '@/services/attendance.service';
import { useStoreStore } from '@/stores/store.store';
import { cn } from '@/lib/cn';

const RUN_LABEL: Record<string, string> = {
  OFF: 'Nghỉ cửa hàng',
  ABSENT: 'Vắng',
  WORK: 'Làm việc',
  PAID_LEAVE: 'Nghỉ có lương',
  UNPAID_LEAVE: 'Nghỉ không lương',
};

function runtimeClass(runtime: string) {
  switch (runtime) {
    case 'WORK':
      return 'text-emerald-700';
    case 'PAID_LEAVE':
      return 'text-amber-700';
    case 'UNPAID_LEAVE':
      return 'text-(--color-warning)';
    case 'ABSENT':
      return 'text-(--color-danger)';
    default:
      return 'text-(--color-text-muted)';
  }
}

export const AttendanceEmployeePage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const { employeeId: employeeIdParam } = useParams();
  const [search] = useSearchParams();
  const month = Number(search.get('month'));
  const year = Number(search.get('year'));
  const eid = Number(employeeIdParam);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-list', storeId, month, year, eid],
    queryFn: async () => {
      const res = await attendanceService.list(storeId!, {
        month,
        year,
        employeeId: eid,
      });
      return res.data.data;
    },
    enabled: !!storeId && !!month && !!year && !Number.isNaN(eid),
  });

  const emp = data?.employees?.[0];

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isLoading && <LoadingOverlay />}
      <Header
        title={emp?.user?.name ?? 'Chi tiết'}
        Icon={CalendarCheck2}
        backUrl={paths.attendance.index}
      />

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            {!isLoading && emp && (
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                {emp.cells.map((cell: any) => (
                  <div key={cell.date} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-(--color-text-main)">
                        {cell.date}
                      </div>
                      <div
                        className={cn('text-xs font-semibold', runtimeClass(cell.runtime))}
                      >
                        {RUN_LABEL[cell.runtime] ?? cell.runtime}
                      </div>
                    </div>
                    {cell.record ? (
                      <Link
                        to={paths.attendance.editRecord(cell.record.id)}
                        state={{ cell, month, year }}
                        className="text-(--color-primary)"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    ) : (
                      cell.runtime === 'ABSENT' && (
                        <Link
                          to={paths.attendance.createRecord}
                          state={{
                            employeeId: emp.employeeId,
                            date: cell.date,
                            month,
                            year,
                          }}
                          className="text-xs font-semibold text-(--color-primary)"
                        >
                          Thêm
                        </Link>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
