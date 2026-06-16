import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { paths } from '@/config/paths';
import { useStoreStore } from '@/stores/store.store';

export const MainLayout: React.FC = () => {
  const store = useStoreStore((s) => s.store);
  const isReadOnly = store?.subscription?.isReadOnly;

  return (
    <div className='h-full flex flex-col min-h-0'>
      {isReadOnly && (
        <Link
          to={paths.settings.subscription}
          className="bg-amber-50 text-amber-800 border-b border-amber-200 px-4 py-2 text-sm font-medium"
        >
          Cửa hàng đã hết hạn. Dữ liệu đang ở chế độ chỉ xem, chạm để gia hạn.
        </Link>
      )}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
};
