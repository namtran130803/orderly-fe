import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createScheduleOverrideSchema = z.object({
  date: z.string().min(1, 'Chọn ngày'),
  type: z.enum(['OFF', 'WORKING_DAY'], {
    message: 'Loại không hợp lệ',
  }),
});

export const createScheduleOverrideResolver = zodResolver(createScheduleOverrideSchema);

export type CreateScheduleOverrideDto = z.infer<typeof createScheduleOverrideSchema>;
