import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const attendanceStatusEnum = z.enum(['WORK', 'PAID_LEAVE', 'UNPAID_LEAVE'], {
  message: 'Trạng thái không hợp lệ',
});

const isLeaveStatus = (status: string) =>
  status === 'PAID_LEAVE' || status === 'UNPAID_LEAVE';

export const attendanceFormSchema = z
  .object({
    status: attendanceStatusEnum,
    checkIn: z.string().optional().or(z.literal('')),
    checkOut: z.string().optional().or(z.literal('')),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (isLeaveStatus(data.status)) return;
    if (!data.checkIn?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Thời gian vào là bắt buộc khi trạng thái là Làm việc',
        path: ['checkIn'],
      });
    }
    // Giờ ra tùy chọn (ca đang mở / chấm linh hoạt)
  });

export const attendanceFormResolver = zodResolver(attendanceFormSchema);

export type AttendanceFormDto = z.infer<typeof attendanceFormSchema>;

/** @deprecated dùng AttendanceFormDto */
export type CreateAttendanceDto = AttendanceFormDto;

export const createAttendanceResolver = attendanceFormResolver;
export const createAttendanceSchema = attendanceFormSchema;
