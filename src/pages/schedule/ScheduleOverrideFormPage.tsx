import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { scheduleService } from '@/services/schedule.service';
import { useStoreStore } from '@/stores/store.store';
import { createScheduleOverrideResolver, type CreateScheduleOverrideDto } from '@/schemas/schedule.schema';

export const ScheduleOverrideFormPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateScheduleOverrideDto>({
    resolver: createScheduleOverrideResolver,
    defaultValues: { date: '', type: 'OFF' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateScheduleOverrideDto) =>
      scheduleService.postOverride(storeId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      navigateBackOrTo(navigate, paths.schedule.index);
    },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header title="Ngày đặc biệt" Icon={CalendarRange} backUrl={paths.schedule.index}>
        <button
          type="submit"
          form="schedule-override-form"
          disabled={isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form
        id="schedule-override-form"
        onSubmit={handleSubmit((data) => mutate(data), onError)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-auto pb-6 mt-4">
          <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">Ngày</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <input
              type="date"
              required
              className="w-full text-sm"
              {...register('date', { required: true })}
            />
          </div>
          <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Loại</h3>
          <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
            <select className="w-full text-sm" {...register('type')}>
              <option value="OFF">Nghỉ</option>
              <option value="WORKING_DAY">Làm bù</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};
