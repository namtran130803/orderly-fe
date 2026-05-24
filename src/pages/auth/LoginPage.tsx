import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { paths } from "@/config/paths";
import { loginResolver, type LoginDto } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
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
  } = useForm<LoginDto>({
    resolver: loginResolver,
    defaultValues: { phone: "0901234567", password: "password123" },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message);
  };

  return (
    <>
      <h2 className="p-4 pb-2 text-sm font-semibold text-(--color-text-secondary)">
        Đăng nhập hệ thống
      </h2>

      <form
        onSubmit={handleSubmit((data) => mutate(data), onError)}
        className="flex-1 flex flex-col"
      >
        {isPending && <LoadingOverlay />}
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Phone className="text-(--color-text-placeholder)" size={24} />
            <input
              type="tel"
              autoFocus
              placeholder="Số điện thoại"
              {...register("phone")}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Lock className="text-(--color-text-placeholder)" size={24} />
            <input
              type="password"
              placeholder="Mật khẩu"
              {...register("password")}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-[60px] bg-(--color-primary) text-(--color-bg-surface) font-semibold text-base mt-auto"
        >
          Đăng nhập
        </button>

        <Link
          to={paths.auth.register}
          className="flex w-full h-[60px] bg-(--color-bg-surface) text-sm font-semibold text-(--color-primary) justify-center items-center"
        >
          Bạn chưa có tài khoản? Đăng ký ngay
        </Link>
      </form>
    </>
  );
};
