import React from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Store,
  BookOpen,
  Grid,
  Activity,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

export const SettingsPage: React.FC = () => {
  const user = { name: 'Trần Trọng Nam', phone: '0987654321' };

  return (
    <div className="flex-1 flex flex-col">
      <Header Icon={Settings} title="Quản lý" />

      <div className='flex-1 relative'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 overflow-auto pb-4'>
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) flex items-center gap-4 px-4 py-3 mt-4">
              <div className="size-12 rounded-full bg-(--color-primary) text-(--color-bg-surface) flex items-center justify-center font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-(--color-text-secondary) truncate">{user.phone}</p>
              </div>
            </div>

            <h3 className="font-semibold text-(--color-text-secondary) p-4 pb-2">Dữ liệu & Vận hành</h3>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-gray-200">
              <Link
                to={paths.stores.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Store className="text-blue-500" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Danh sách cửa hàng
                  </span>
                </div>
                <ChevronRight size={20} className="text-(--color-text-placeholder)" />
              </Link>

              <Link
                to={paths.menu.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="text-emerald-500" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Danh mục & Món ăn
                  </span>
                </div>
                <ChevronRight size={20} className="text-(--color-text-placeholder)" />
              </Link>

              <Link
                to={paths.areas.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Grid className="text-orange-500" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Khu vực & Bàn
                  </span>
                </div>
                <ChevronRight size={20} className="text-(--color-text-placeholder)" />
              </Link>

              <Link
                to={paths.statuses.index}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Activity className="text-purple-500" size={20} />
                  <span className="text-sm text-(--color-text-main) font-medium">
                    Quy trình phục vụ
                  </span>
                </div>
                <ChevronRight size={20} className="text-(--color-text-placeholder)" />
              </Link>
            </div>

            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) mt-4">
              <Link to={paths.auth.login}
                className="w-full px-4 py-3 flex items-center justify-start gap-3 text-(--color-danger)"
              >
                <LogOut size={20} />
                <span className="text-sm font-semibold">Đăng xuất</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
