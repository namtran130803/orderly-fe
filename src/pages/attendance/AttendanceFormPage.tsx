import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CalendarCheck2, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { attendanceService } from '@/services/attendance.service';
import { useStoreStore } from '@/stores/store.store';
import {
  attendanceFormSchema,
  type AttendanceFormDto,
} from '@/schemas/attendance.schema';
import { isoToVnInput, vnInputToIso } from '@/lib/date-vn';

const isLeaveStatus = (status: string) =>
  status === 'PAID_LEAVE' || status === 'UNPAID_LEAVE';

type AttendanceStatus = AttendanceFormDto['status'];

type CreateState = {
  employeeId: number;
  date: string;
  month: number;
  year: number;
};

type EditState = {
  employeeId: number;
  month: number;
  year: number;
  cell?: {
    record?: {
      id: number;
      status: string;
      checkIn: string | null;
      checkOut: string | null;
      note: string | null;
    };
  };
};

type Props = {
  type: 'create' | 'edit';
};

type TimeFields = Pick<AttendanceFormDto, 'checkIn' | 'checkOut' | 'note'>;

function buildPayload(status: AttendanceStatus, vals: TimeFields) {
  const leave = isLeaveStatus(status);
  return {
    status,
    note: vals.note || null,
    checkIn: leave
      ? null
      : vals.checkIn?.trim()
        ? vnInputToIso(vals.checkIn)
        : null,
    checkOut: leave
      ? null
      : vals.checkOut?.trim()
        ? vnInputToIso(vals.checkOut)
        : null,
  };
}

function toTimeFields(record: {
  checkIn: string | null;
  checkOut: string | null;
  note: string | null;
}): TimeFields {
  return {
    checkIn: isoToVnInput(record.checkIn),
    checkOut: isoToVnInput(record.checkOut),
    note: record.note ?? '',
  };
}

export const AttendanceFormPage: React.FC<Props> = ({ type }) => {
  const { attendanceId } = useParams();
  const recordId =
    type === 'edit' && attendanceId ? Number(attendanceId) : null;

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const createSt = location.state as CreateState | undefined;
  const editSt = location.state as EditState | undefined;
  const hydratedId = useRef<string | null>(null);

  const previewRecord = editSt?.cell?.record;
  const [status, setStatus] = useState<AttendanceStatus>('WORK');

  useEffect(() => {
    if (type === 'create' && (!createSt?.employeeId || !createSt?.date)) {
      navigate(paths.attendance.index, { replace: true });
    }
  }, [type, createSt, navigate]);

  useEffect(() => {
    if (type === 'edit' && (!recordId || Number.isNaN(recordId))) {
      navigate(paths.attendance.index, { replace: true });
    }
  }, [type, recordId, navigate]);

  const {
    data: recordRes,
    isLoading: isLoadingRecord,
    isError: isRecordError,
  } = useQuery({
    queryKey: ['attendance', storeId, recordId],
    queryFn: () => attendanceService.getById(storeId!, recordId!),
    enabled: type === 'edit' && !!storeId && !!recordId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const record = recordRes?.data?.data;

  useEffect(() => {
    if (type === 'edit' && isRecordError) {
      toast.error('Không tìm thấy bản ghi chấm công');
      navigate(paths.attendance.index, { replace: true });
    }
  }, [type, isRecordError, navigate]);

  const { register, handleSubmit, reset, setValue } = useForm<TimeFields>({
    defaultValues: { checkIn: '', checkOut: '', note: '' },
  });

  // Reset cờ hydrate khi đổi route (không gọi reset() ở đây — tránh xóa input khi gõ)
  useEffect(() => {
    hydratedId.current = null;
  }, [recordId, type]);

  // Nạp form một lần theo từng nguồn dữ liệu
  useEffect(() => {
    if (type === 'create') {
      if (hydratedId.current === 'create') return;
      hydratedId.current = 'create';
      setStatus('WORK');
      reset({ checkIn: '', checkOut: '', note: '' });
      return;
    }

    // Ưu tiên dữ liệu từ lưới (đã gộp đúng giờ hiển thị), API bổ sung khi chưa có preview
    if (previewRecord?.id) {
      const key = `preview-${previewRecord.id}`;
      if (hydratedId.current !== key) {
        hydratedId.current = key;
        setStatus(previewRecord.status as AttendanceStatus);
        reset(toTimeFields(previewRecord));
      }
    }

    if (record?.id) {
      const key = `api-${record.id}`;
      if (hydratedId.current === key) return;
      // Cùng id với preview: giữ giờ từ lưới (tránh lệch khi gộp nhiều ca)
      if (hydratedId.current === `preview-${record.id}`) {
        hydratedId.current = key;
        setStatus(record.status as AttendanceStatus);
        return;
      }
      hydratedId.current = key;
      setStatus(record.status as AttendanceStatus);
      reset(toTimeFields(record));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate theo id, không theo object reference
  }, [
    type,
    record?.id,
    record?.status,
    record?.checkIn,
    record?.checkOut,
    record?.note,
    previewRecord?.id,
    previewRecord?.status,
    previewRecord?.checkIn,
    previewRecord?.checkOut,
    previewRecord?.note,
  ]);

  const showWorkTimes = status === 'WORK';

  const backUrl =
    type === 'edit'
      ? editSt?.employeeId
        ? `${paths.attendance.employee(editSt.employeeId)}?month=${editSt.month}&year=${editSt.year}`
        : paths.attendance.index
      : createSt
        ? `${paths.attendance.employee(createSt.employeeId)}?month=${createSt.month}&year=${createSt.year}`
        : paths.attendance.index;

  const { mutate, isPending } = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      type === 'create'
        ? attendanceService.create(storeId!, body)
        : attendanceService.patch(storeId!, recordId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['attendance-employee'], exact: false });
      if (type === 'edit' && recordId) {
        queryClient.invalidateQueries({ queryKey: ['attendance', storeId, recordId] });
      }
      navigateBackOrTo(navigate, backUrl);
    },
    onError: (e: any) => {
      const details = e.response?.data?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details.map((d: { message: string }) => d.message).join(', '));
        return;
      }
      toast.error(e.response?.data?.error?.message ?? 'Lỗi');
    },
  });

  const onStatusChange = (next: AttendanceStatus) => {
    setStatus(next);
    if (isLeaveStatus(next)) {
      setValue('checkIn', '');
      setValue('checkOut', '');
    }
  };

  const onSubmit = (vals: TimeFields) => {
    const parsed = attendanceFormSchema.safeParse({ ...vals, status });
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(', ');
      toast.error(msg || 'Dữ liệu không hợp lệ');
      return;
    }

    const payload = buildPayload(parsed.data.status, parsed.data);

    if (type === 'edit') {
      mutate(payload);
      return;
    }
    if (!createSt?.employeeId || !createSt?.date) {
      toast.error('Thiếu thông tin');
      return;
    }
    mutate({
      employeeId: createSt.employeeId,
      date: createSt.date,
      ...payload,
    });
  };

  if (!storeId) return null;

  const title = type === 'create' ? 'Thêm chấm công' : 'Sửa chấm công';
  const formId = 'attendance-form';
  const loading =
    isPending || (type === 'edit' && isLoadingRecord && !previewRecord);

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {loading && <LoadingOverlay />}
      <Header title={title} Icon={CalendarCheck2} backUrl={backUrl}>
        <button
          type="submit"
          form={formId}
          className="text-(--color-primary)"
          disabled={loading}
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6 mt-4 space-y-0">
          <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">
            Trạng thái
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <select
              className="w-full text-sm bg-(--color-bg-surface) text-(--color-text-main)"
              value={status}
              disabled={loading}
              onChange={(e) => onStatusChange(e.target.value as AttendanceStatus)}
            >
              <option value="WORK">Làm việc</option>
              <option value="PAID_LEAVE">Nghỉ có lương</option>
              <option value="UNPAID_LEAVE">Nghỉ không lương</option>
            </select>
          </div>

          {showWorkTimes ? (
            <>
              <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
                Giờ
              </h3>
              <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
                <div className="px-4 py-3 flex items-center gap-4">
                  <span className="text-sm flex-none">Vào</span>
                  <input
                    type="datetime-local"
                    disabled={loading}
                    className="flex-1 text-right text-sm min-w-0"
                    {...register('checkIn')}
                  />
                </div>
                <div className="px-4 py-3 flex items-center gap-4">
                  <span className="text-sm flex-none">Ra</span>
                  <input
                    type="datetime-local"
                    disabled={loading}
                    className="flex-1 text-right text-sm min-w-0"
                    {...register('checkOut')}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-(--color-text-muted) px-4 pt-2">
              Trạng thái nghỉ không cần giờ vào/ra.
            </p>
          )}

          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">
            Ghi chú
          </h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <textarea rows={3} className="w-full text-sm" {...register('note')} />
          </div>
        </div>
      </form>
    </div>
  );
};
