import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { paths } from '@/config/paths';
import { navigateBackOrTo } from '@/lib/browser-history';
import { scheduleService } from '@/services/schedule.service';
import { useStoreStore } from '@/stores/store.store';

export const ScheduleOverrideFormPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const storeId = useStoreStore((s) => s.store?.id);
  const [date, setDate] = useState('');
  const [type, setType] = useState<'OFF' | 'WORKING_DAY'>('OFF');

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      scheduleService.postOverride(storeId!, { date, type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      navigateBackOrTo(navigate, paths.schedule.index);
    },
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {isPending && <LoadingOverlay />}
      <Header title="Ngày đặc biệt" Icon={CalendarRange} backUrl={paths.schedule.index}>
        <button
          type="button"
          onClick={() => date && mutate()}
          disabled={!date || isPending}
          className="text-(--color-primary) disabled:opacity-50"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <div className="flex-1 overflow-auto pb-6 mt-4">
        <h3 className="font-semibold text-(--color-text-secondary) px-4 pb-2">Ngày</h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm"
          />
        </div>
        <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Loại</h3>
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) px-4 py-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'OFF' | 'WORKING_DAY')}
            className="w-full text-sm"
          >
            <option value="OFF">Nghỉ (OFF)</option>
            <option value="WORKING_DAY">Làm bù (WORKING_DAY)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
