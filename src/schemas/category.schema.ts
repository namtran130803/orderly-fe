import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống').max(100),
});

export const createCategoryResolver = zodResolver(createCategorySchema);

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
