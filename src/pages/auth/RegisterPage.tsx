import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import { registerResolver, type RegisterDto } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (res) => {
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      toast.success(res.data.message);
      navigate(paths.overview.index, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>({
    resolver: registerResolver,
    defaultValues: { name: '', phone: '', password: '' },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <>
      <h2 className="p-4 pb-2 text-sm font-semibold text-(--color-text-secondary)">
        Đăng ký tài khoản mới
      </h2>

      <form onSubmit={handleSubmit((data) => mutate(data), onError)} className="flex-1 flex flex-col relative">
        {isPending && <LoadingOverlay />}
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="px-4 flex h-[50px] items-center gap-4">
            <User className="text-(--color-text-placeholder)" size={18} />
            <input
              type="text"
              autoFocus
              placeholder="Họ và tên"
              {...register('name')}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Phone className="text-(--color-text-placeholder)" size={18} />
            <input
              type="tel"
              placeholder="Số điện thoại"
              {...register('phone')}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Lock className="text-(--color-text-placeholder)" size={18} />
            <input
              type="password"
              placeholder="Mật khẩu"
              {...register('password')}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-[60px] bg-(--color-primary) text-(--color-bg-surface) font-semibold text-base mt-auto"
        >
          Đăng ký
        </button>

        <Link
          to={paths.auth.login}
          className="flex w-full h-[60px] bg-(--color-bg-surface) text-sm font-semibold text-(--color-primary) justify-center items-center"
        >
          Bạn đã có tài khoản? Đăng nhập ngay
        </Link>
      </form>
    </>
  );
};
