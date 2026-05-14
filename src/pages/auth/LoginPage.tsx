import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock } from 'lucide-react';
import { paths } from '@/config/paths';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('0901234567');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(paths.overview.index, { replace: true });
  };

  return (
    <>
      <h2 className="p-4 pb-2 text-sm font-semibold text-(--color-text-secondary)">
        Đăng nhập hệ thống
      </h2>

      <form onSubmit={handleLogin} className="flex-1 flex flex-col">
        {/* Input group */}
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Phone className="text-(--color-text-placeholder)" size={24} />
            <input
              type="tel"
              autoFocus
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Lock className="text-(--color-text-placeholder)" size={24} />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          to="/auth/register"
          className="flex w-full h-[60px] bg-(--color-bg-surface) text-sm font-semibold text-(--color-primary) justify-center items-center"
        >
          Bạn chưa có tài khoản? Đăng ký ngay
        </Link>
      </form>
    </>
  );
};
