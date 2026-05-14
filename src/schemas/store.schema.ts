import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const createStoreSchema = z.object({
  name: z.string().trim().min(1, 'Tên cửa hàng không được để trống').max(150),
  address: z.string().trim().max(255).optional().or(z.literal('')),
});

export const createStoreResolver = zodResolver(createStoreSchema);

export type CreateStoreDto = z.infer<typeof createStoreSchema>;
