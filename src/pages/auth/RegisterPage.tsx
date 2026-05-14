import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User } from 'lucide-react';
import { paths } from '@/config/paths';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  return (
    <>
      <h2 className="p-4 pb-2 text-sm font-semibold text-(--color-text-secondary)">
        Đăng ký tài khoản mới
      </h2>

      <form onSubmit={handleRegister} className="flex-1 flex flex-col">
        <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="px-4 flex h-[50px] items-center gap-4">
            <User className="text-(--color-text-placeholder)" size={18} />
            <input
              type="text"
              autoFocus
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Phone className="text-(--color-text-placeholder)" size={18} />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-full text-sm placeholder:text-(--color-text-placeholder)"
            />
          </div>
          <div className="px-4 flex h-[50px] items-center gap-4">
            <Lock className="text-(--color-text-placeholder)" size={18} />
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
