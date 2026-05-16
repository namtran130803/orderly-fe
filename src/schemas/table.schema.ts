import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const updateTableSchema = z.object({
  name: z.string().trim().min(1, 'Tên bàn không được để trống').max(100),
});

export const updateTableResolver = zodResolver(updateTableSchema);

export type UpdateTableDto = z.infer<typeof updateTableSchema>;
