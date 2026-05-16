import React from 'react';
import { Outlet } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Brand Header */}
      <div className="bg-(--color-bg-surface) border-b border-(--color-border-main) h-[200px] flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="size-12 bg-(--color-primary) flex items-center justify-center text-(--color-bg-surface) mb-4">
          <StoreIcon size={24} />
        </div>
        {/* Name */}
        <h1 className="text-2xl font-bold text-(--color-text-main) tracking-tight">Orderly</h1>
        <div className="mt-1 h-0.5 w-8 bg-(--color-primary)"></div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {children || <Outlet />}
      </div>
    </div>
  );
};
