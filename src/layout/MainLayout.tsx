import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className='h-full flex flex-col min-h-0'>
      <div className="flex-1 flex flex-col min-h-0 relative">
        <Outlet />
      </div>
      <Navbar />
    </div>
  );
};
