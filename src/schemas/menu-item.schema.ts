import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, 'Tên món không được để trống').max(150),
  price: z.number({ message: 'Giá không hợp lệ' }).int().positive('Giá phải là số dương'),
  categoryId: z.number({ message: 'Vui lòng chọn danh mục' }).int().positive(),
});

export const createMenuItemResolver = zodResolver(createMenuItemSchema);

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>;
