import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandCoins, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { paths } from '@/config/paths';
import { formatMoney } from '@/utils/formatMoney';
import { payrollService } from '@/services/payroll.service';
import { useStoreStore } from '@/stores/store.store';

export const PayrollPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const qc = useQueryClient();
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [y, m] = useMemo(() => {
    const [yy, mm] = ym.split('-').map(Number);
    return [yy, mm];
  }, [ym]);

  const [dlg, setDlg] = useState<'lock' | 'unlock' | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', storeId, m, y],
    queryFn: async () => {
      const res = await payrollService.preview(storeId!, m, y);
      return res.data.data;
    },
    enabled: !!storeId,
  });

  const { mutate: lock, isPending: locking } = useMutation({
    mutationFn: () => payrollService.lock(storeId!, m, y),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', storeId, m, y] }),
  });

  const { mutate: unlock, isPending: unlocking } = useMutation({
    mutationFn: () => payrollService.unlock(storeId!, m, y),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', storeId, m, y] }),
  });

  const busy = locking || unlocking;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {(isLoading || busy) && <LoadingOverlay />}
      <Header title="Bảng lương" Icon={HandCoins} backUrl={paths.settings.index} />

      <div className="flex-1 overflow-auto pb-6 mt-4">
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium flex-none">Tháng</span>
          <input
            type="month"
            value={ym}
            onChange={(e) => setYm(e.target.value)}
            className="flex-1 text-right text-sm"
          />
        </div>

        {data?.locked && (
          <div className="px-4 py-2 text-xs font-semibold text-(--color-warning) bg-(--color-bg-surface) border-b border-(--color-border-main)">
            Kỳ lương đã khóa
          </div>
        )}

        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main) mt-2">
          {data?.employees?.map((e: any) => (
            <Link
              key={e.employeeId}
              to={`${paths.payroll.employeeDetail(e.employeeId)}?month=${m}&year=${y}`}
              state={{ month: m, year: y }}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{e.user.name}</div>
              <div className="text-[11px] text-(--color-text-secondary) mt-1">
                Chuẩn {e.standardDays} · Trả lương {e.paidDays} ngày
              </div>
                <div className="text-sm font-semibold text-(--color-primary) mt-1">
                  {formatMoney(e.salary)}
                </div>
              </div>
              <ChevronRight size={20} className="text-(--color-text-placeholder) flex-none" />
            </Link>
          ))}
        </div>

        {!data?.locked ? (
          <button
            type="button"
            onClick={() => setDlg('lock')}
            className="mt-6 w-full py-3 text-sm font-semibold border-y border-(--color-border-main) bg-(--color-bg-surface) text-(--color-primary)"
          >
            Khóa kỳ lương
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDlg('unlock')}
            className="mt-6 w-full py-3 text-sm font-semibold border-y border-(--color-border-main) bg-(--color-bg-surface) text-(--color-danger)"
          >
            Mở khóa kỳ lương
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={dlg === 'lock'}
        title="Khóa kỳ lương?"
        description="Sau khi khóa không sửa chấm công / duyệt nghỉ trong tháng này."
        variant="warning"
        onConfirm={() => {
          lock();
          setDlg(null);
        }}
        onCancel={() => setDlg(null)}
      />
      <ConfirmDialog
        isOpen={dlg === 'unlock'}
        title="Mở kỳ lương?"
        description="Xóa bản ghi khóa để chỉnh sửa lại dữ liệu."
        variant="danger"
        onConfirm={() => {
          unlock();
          setDlg(null);
        }}
        onCancel={() => setDlg(null)}
      />
    </div>
  );
};
