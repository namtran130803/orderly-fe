import { api } from '@/lib/api';
import type { LoginDto, RegisterDto } from '@/schemas/auth.schema';

type AuthResponse = {
  token: string;
  user: { id: number; name: string; phone: string; createdAt: string };
};

export const authService = {
  login: (data: LoginDto) =>
    api.post<{ success: true; data: AuthResponse; message: string }>('/auth/login', data),

  register: (data: RegisterDto) =>
    api.post<{ success: true; data: AuthResponse; message: string }>('/auth/register', data),

  getMe: () =>
    api.get<{ success: true; data: AuthResponse['user']; message: string }>('/auth/me'),
};
