import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createLeaveSchema = z.object({
  fromDate: z.string().min(1, 'Chọn ngày bắt đầu'),
  toDate: z.string().min(1, 'Chọn ngày kết thúc'),
  isPaid: z.boolean(),
  reason: z.string().optional(),
});

export const createLeaveResolver = zodResolver(createLeaveSchema);

export type CreateLeaveDto = z.infer<typeof createLeaveSchema>;
