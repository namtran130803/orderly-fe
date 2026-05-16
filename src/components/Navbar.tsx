import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Utensils, Settings, HandCoins } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Navbar: React.FC = () => {
  const pages = [
    { label: 'Tổng quan', to: '/overview', icon: BarChart3 },
    { label: 'Đơn hàng', to: '/orders', icon: Utensils },
    { label: 'Chi tiêu', to: '/expenses', icon: HandCoins },
    { label: 'Quản lý', to: '/settings', icon: Settings },
  ]

  return (
    <nav className="bg-(--color-bg-surface) border-t border-(--color-border-main) flex justify-center items-center h-[60px]">
      {pages.map((page) => {
        const Icon = page.icon;

        return <NavLink
          key={page.to}
          to={page.to}
          className={({ isActive }) => cn(
            'flex flex-col items-center justify-center flex-1',
            isActive ? 'text-(--color-primary)' : 'text-(--color-text-tertiary)'
          )}
        >
          <Icon size={24} />
          <span className={'text-[10px] mt-0.5 font-medium'}>
            {page.label}
          </span>
        </NavLink>
      })}
    </nav>
  );
};