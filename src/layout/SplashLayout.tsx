import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { clearAll } from '@/stores/clear';
import { paths } from '@/config/paths';

const authRoutes = [paths.auth.login, paths.auth.register];

export const SplashLayout: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const isAuthRoute = authRoutes.includes(location.pathname);

  const { isFetching, data, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authService.getMe();
      return res.data.data;
    },
    enabled: !!token && !user,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (isError) clearAll();
  }, [isError]);

  useEffect(() => {
    if (isFetching) return;
    if (token && isAuthRoute) navigate(paths.overview.index, { replace: true });
    else if (!token && !isAuthRoute) navigate(paths.auth.login, { replace: true });
    else setIsRedirecting(false);
  }, [isFetching, token, isAuthRoute, navigate]);

  if (!token && !isAuthRoute) {
    return <Navigate to={paths.auth.login} replace />;
  }

  if (isFetching || isRedirecting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-(--color-bg-surface)">
        <div className="size-12 bg-(--color-primary) flex items-center justify-center text-(--color-bg-surface) mb-4">
          <StoreIcon size={24} />
        </div>
        <h1 className="text-2xl font-bold text-(--color-text-main) tracking-tight mb-1">Orderly</h1>
        <div className="h-0.5 w-8 bg-(--color-primary) mb-6" />
        <div className="size-5 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
};
