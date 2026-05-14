import { Outlet } from 'react-router-dom';

export const AppShell: React.FC = () => {
  return (
    <div className="h-svh w-svw">
      <div className='h-full max-w-[390px] mx-auto bg-(--color-bg-main) border-x border-(--color-border-main)'>
        <Outlet />
      </div>
    </div>
  );
};
