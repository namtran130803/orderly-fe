import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(255),
  amount: z.number({ message: 'Số tiền không hợp lệ' }).positive('Số tiền phải là số dương'),
  rawDate: z.string().optional(),
});

export const createExpenseResolver = zodResolver(createExpenseSchema);

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
