import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createAreaSchema = z.object({
  name: z.string().trim().min(1, 'Tên khu vực không được để trống').max(100),
  tableCount: z.number({ message: 'Số lượng bàn không hợp lệ' }).int().positive('Số lượng bàn phải lớn hơn 0').max(100),
});

export const createAreaResolver = zodResolver(createAreaSchema);

export type CreateAreaDto = z.infer<typeof createAreaSchema>;
