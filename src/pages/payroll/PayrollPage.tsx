import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleDollarSign, ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { formatMoney } from "@/utils/formatMoney";
import { payrollService } from "@/services/payroll.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";
import { useAuthStore } from "@/stores/auth.store";

export const PayrollPage: React.FC = () => {
  const storeId = useStoreStore((s) => s.store?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s: any) => s.user);

  const canPreview = usePerm(PERMS.payroll.preview);
  const canLock = usePerm(PERMS.payroll.lock);

  useEffect(() => {
    if (!canPreview) {
      navigate(paths.payroll.me, { replace: true });
    }
  }, [canPreview, navigate]);

  const [dlg, setDlg] = useState<"lock" | "unlock" | null>(null);

  const now = new Date();
  const [ym, setYm] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [y, m] = ym.split("-").map(Number);

  const { data, isLoading } = useQuery({
    queryKey: ["payroll", storeId, m, y],
    queryFn: async () => {
      const res = await payrollService.preview(storeId!, m, y);
      return res.data.data;
    },
    enabled: !!storeId && canPreview,
  });

  const employees =
    data?.employees?.filter((e: any) => e.user.id !== user.id) || [];

  const hasEmployees = employees.length > 0;

  const { mutate: lock, isPending: locking } = useMutation({
    mutationFn: () => payrollService.lock(storeId!, m, y),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payroll", storeId, m, y] }),
  });

  const { mutate: unlock, isPending: unlocking } = useMutation({
    mutationFn: () => payrollService.unlock(storeId!, m, y),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payroll", storeId, m, y] }),
  });

  const busy = locking || unlocking;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {(isLoading || busy) && <LoadingOverlay />}
      <Header
        title="Bảng lương"
        Icon={CircleDollarSign}
        backUrl={paths.settings.index}
      />

      <div className="flex-1 overflow-auto py-4 flex flex-col gap-4">
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
            Lương đã bị khóa
          </div>
        )}

        {!isLoading && !hasEmployees && (
          <div className="flex flex-col items-center justify-center flex-1 text-(--color-text-muted)">
            <CircleDollarSign size={48} className="mb-2 opacity-50" />
            <p className="text-sm">Chưa có nhân viên</p>
          </div>
        )}

        {hasEmployees && (
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
            {employees.map((e: any) => (
              <Link
                key={e.employeeId}
                to={`${paths.payroll.employeeDetail(e.employeeId)}?month=${m}&year=${y}`}
                state={{ month: m, year: y }}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {e.user.name}
                  </div>
                  <div className="text-[11px] text-(--color-text-secondary) mt-1">
                    {e.paidDays} / {e.standardDays} ngày
                  </div>
                  <div className="text-sm font-semibold text-(--color-success) mt-1">
                    {formatMoney(e.salary)}
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-(--color-text-placeholder) flex-none"
                />
              </Link>
            ))}
          </div>
        )}

        {hasEmployees &&
          (!data?.locked && canLock ? (
            <button
              type="button"
              onClick={() => setDlg("lock")}
              className="w-full py-3 text-sm font-semibold border-y border-(--color-border-main) bg-(--color-bg-surface) text-(--color-danger)"
            >
              Khóa lương
            </button>
          ) : data?.locked && canLock ? (
            <button
              type="button"
              onClick={() => setDlg("unlock")}
              className="w-full py-3 text-sm font-semibold border-y border-(--color-border-main) bg-(--color-bg-surface) text-(--color-danger)"
            >
              Mở khóa lương
            </button>
          ) : null)}
      </div>

      <ConfirmDialog
        isOpen={dlg === "lock"}
        title="Khóa lương?"
        description="Sau khi khóa không sửa chấm công / duyệt nghỉ trong tháng này."
        variant="danger"
        onConfirm={() => {
          lock();
          setDlg(null);
        }}
        onCancel={() => setDlg(null)}
      />
      <ConfirmDialog
        isOpen={dlg === "unlock"}
        title="Mở khóa lương?"
        description="Xóa bản ghi khóa để sửa lại dữ liệu."
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
