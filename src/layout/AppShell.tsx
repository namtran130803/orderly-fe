import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/cn';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/ladi';

  return (
    <div className="h-svh w-svw">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
        }}
      />
      <div
        className={cn(
          'h-full mx-auto bg-(--color-bg-main)',
          isLanding
            ? 'w-full overflow-auto scroll-smooth'
            : 'max-w-[390px] border-x border-(--color-border-main)',
        )}
      >
        <Outlet />
      </div>
    </div>
  );
};
