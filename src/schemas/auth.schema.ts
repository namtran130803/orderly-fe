import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const phoneSchema = z.string().regex(/^(0|\+84)[3-9]\d{8}$/, 'Số điện thoại không hợp lệ');

const baseAuthSchema = z.object({
  phone: phoneSchema,
});

export const loginSchema = baseAuthSchema.extend({
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const loginResolver = zodResolver(loginSchema);

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = baseAuthSchema.extend({
  name: z.string().trim().min(1, 'Tên không được để trống').max(100),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const registerResolver = zodResolver(registerSchema);

export type RegisterDto = z.infer<typeof registerSchema>;
