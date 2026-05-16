import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createStatusSchema = z.object({
  name: z.string().trim().min(1, 'Tên trạng thái không được để trống').max(50),
});

export const createStatusResolver = zodResolver(createStatusSchema);

export type CreateStatusDto = z.infer<typeof createStatusSchema>;
