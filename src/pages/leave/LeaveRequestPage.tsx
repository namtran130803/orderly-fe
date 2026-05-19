import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Palmtree, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { leaveService } from '@/services/leave.service';
import { useStoreStore } from '@/stores/store.store';

type Form = {
  fromDate: string;
  toDate: string;
  isPaid: boolean;
  reason: string;
};

export const LeaveRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { register, handleSubmit } = useForm<Form>({
    defaultValues: { isPaid: false, reason: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (body: Form) =>
      leaveService.create(storeId!, {
        fromDate: body.fromDate,
        toDate: body.toDate,
        isPaid: body.isPaid,
        reason: body.reason || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaves'] });
      navigateBackOrTo(navigate, paths.leave.index);
    },
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header title="Xin nghỉ" Icon={Palmtree} backUrl={paths.leave.index}>
        <button type="submit" form="leave-req" className="text-(--color-primary)" disabled={isPending}>
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id="leave-req"
        onSubmit={handleSubmit((v) => mutate(v))}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6 mt-4">
          <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">Từ ngày</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <input type="date" required className="w-full text-sm" {...register('fromDate', { required: true })} />
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Đến ngày</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <input type="date" required className="w-full text-sm" {...register('toDate', { required: true })} />
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Nghỉ có lương</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <label className="flex items-center justify-between text-sm">
              <span>Có</span>
              <input type="checkbox" {...register('isPaid')} />
            </label>
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Lý do</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <textarea rows={4} className="w-full text-sm" {...register('reason')} />
          </div>
        </div>
      </form>
    </div>
  );
};
