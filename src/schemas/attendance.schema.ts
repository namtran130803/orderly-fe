import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createAttendanceSchema = z.object({
  status: z.enum(['WORK', 'PAID_LEAVE', 'UNPAID_LEAVE'], {
    message: 'Trạng thái không hợp lệ',
  }),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  note: z.string().optional(),
});

export const createAttendanceResolver = zodResolver(createAttendanceSchema);

export type CreateAttendanceDto = z.infer<typeof createAttendanceSchema>;
