import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export const AppShell: React.FC = () => {
  return (
    <div className="h-svh w-svw">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
        }}
      />
      <div className='h-full max-w-[390px] mx-auto bg-(--color-bg-main) border-x border-(--color-border-main)'>
        <Outlet />
      </div>
    </div>
  );
};
