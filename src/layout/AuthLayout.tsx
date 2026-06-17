import React from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Brand Header */}
      <div className="bg-(--color-bg-surface) border-b border-(--color-border-main) h-[200px] flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="bg-(--color-primary) mb-4">
          <img src="/orderly-icon.svg" alt="Logo" className="size-12" />
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
