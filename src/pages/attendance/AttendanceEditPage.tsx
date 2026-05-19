import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CalendarCheck2, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { attendanceService } from '@/services/attendance.service';
import { useStoreStore } from '@/stores/store.store';

type FormVals = {
  status: 'WORK' | 'PAID_LEAVE' | 'UNPAID_LEAVE';
  checkIn: string;
  checkOut: string;
  note: string;
};

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const AttendanceEditPage: React.FC = () => {
  const { attendanceId } = useParams();
  const id = Number(attendanceId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const location = useLocation();
  const cell = (location.state as any)?.cell;

  const { register, handleSubmit, reset } = useForm<FormVals>({
    defaultValues: {
      status: 'WORK',
      checkIn: '',
      checkOut: '',
      note: '',
    },
  });

  useEffect(() => {
    if (cell?.record) {
      reset({
        status: cell.record.status,
        checkIn: isoToLocalInput(cell.record.checkIn),
        checkOut: isoToLocalInput(cell.record.checkOut),
        note: cell.record.note ?? '',
      });
    }
  }, [cell, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      attendanceService.patch(storeId!, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] });
      navigateBackOrTo(navigate, paths.attendance.index);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error?.message ?? 'Lỗi');
    },
  });

  const onSubmit = (vals: FormVals) => {
    mutate({
      status: vals.status,
      note: vals.note || null,
      checkIn: vals.checkIn ? new Date(vals.checkIn).toISOString() : null,
      checkOut: vals.checkOut ? new Date(vals.checkOut).toISOString() : null,
    });
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header
        title="Sửa chấm công"
        Icon={CalendarCheck2}
        backUrl={paths.attendance.index}
      >
        <button
          type="submit"
          form="attendance-edit-form"
          className="text-(--color-primary)"
          disabled={isPending}
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id="attendance-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6 mt-4 space-y-0">
          <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">
            Trạng thái
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <select
              className="w-full text-sm"
              {...register('status')}
            >
              <option value="WORK">Làm việc</option>
              <option value="PAID_LEAVE">Nghỉ có lương</option>
              <option value="UNPAID_LEAVE">Nghỉ không lương</option>
            </select>
          </div>

          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Giờ</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4">
            <span className="text-sm flex-none">Vào</span>
            <input type="datetime-local" className="flex-1 text-right text-sm" {...register('checkIn')} />
          </div>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3 flex items-center gap-4 mt-px">
            <span className="text-sm flex-none">Ra</span>
            <input type="datetime-local" className="flex-1 text-right text-sm" {...register('checkOut')} />
          </div>

          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Ghi chú</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <textarea rows={3} className="w-full text-sm" {...register('note')} />
          </div>
        </div>
      </form>
    </div>
  );
};
