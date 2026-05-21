import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MoveRight, Palmtree } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { paths } from "@/config/paths";
import { navigateBackOrTo } from "@/lib/browser-history";
import { leaveService } from "@/services/leave.service";
import { useStoreStore } from "@/stores/store.store";
import { usePerm } from "@/hooks/usePerm";
import { PERMS } from "@/config/perms";
import { cn } from "@/lib/cn";

export const LeaveDetailPage: React.FC = () => {
  const { leaveId } = useParams();
  const id = Number(leaveId);
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const row = (location.state as any)?.row;

  const canApprove = usePerm(PERMS.leave.approve);
  const canReject = usePerm(PERMS.leave.reject);

  const [dlg, setDlg] = useState<"ap" | "rj" | null>(null);

  const { mutate: approve, isPending: apP } = useMutation({
    mutationFn: () => leaveService.approve(storeId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      navigateBackOrTo(navigate, paths.leave.index);
    },
  });

  const { mutate: reject, isPending: rjP } = useMutation({
    mutationFn: () => leaveService.reject(storeId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      navigateBackOrTo(navigate, paths.leave.index);
    },
  });

  const p = apP || rjP;
  const r = row;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {p && <LoadingOverlay />}
      <Header
        title={r?.employee?.user?.name || "??n ngh?"}
        Icon={Palmtree}
        backUrl={paths.leave.index}
      />

      <div className="flex-1 overflow-auto pb-6 mt-4">
        {r && (
          <>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 space-y-1">
              <div className="text-sm font-semibold">
                {r.employee?.user?.name}
              </div>
              <div className="text-xs text-(--color-text-secondary) flex items-center gap-2">
                {r.fromDate?.slice?.(0, 10)} <MoveRight size={12} />{" "}
                {r.toDate?.slice?.(0, 10)}
              </div>
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold",
                  r.isPaid
                    ? "text-(--color-warning)"
                    : "text-(--color-text-secondary)",
                )}
              >
                {r.isPaid ? "Nghỉ có lương" : "Nghỉ không lương"}
              </span>
            </div>
            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
              Lý do
            </h3>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 text-sm whitespace-pre-wrap">
              {r.reason || "Chưa có lý do"}
            </div>

            {r.status === "PENDING" && (canApprove || canReject) && (
              <div className="mt-6 divide-y divide-(--color-border-main) border-y border-(--color-border-main)">
                {canApprove && (
                  <button
                    type="button"
                    onClick={() => setDlg("ap")}
                    className="w-full py-3 text-sm font-semibold bg-(--color-bg-surface) text-(--color-success)"
                  >
                    Duyệt
                  </button>
                )}
                {canReject && (
                  <button
                    type="button"
                    onClick={() => setDlg("rj")}
                    className="w-full py-3 text-sm font-semibold bg-(--color-bg-surface) text-(--color-danger)"
                  >
                    Từ chối
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={dlg === "ap"}
        title="Duyệt đơn nghỉ?"
        description="Hệ thống sẽ ghi nhận các ngày nghỉ vào chấm công."
        confirmText="Duyệt"
        variant="success"
        onConfirm={() => {
          approve();
          setDlg(null);
        }}
        onCancel={() => setDlg(null)}
      />
      <ConfirmDialog
        isOpen={dlg === "rj"}
        title="Từ chối đơn nghỉ?"
        description="Không thể hoàn tác."
        confirmText="Từ chối"
        variant="danger"
        onConfirm={() => {
          reject();
          setDlg(null);
        }}
        onCancel={() => setDlg(null)}
      />
    </div>
  );
};
