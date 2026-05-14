import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className='h-full flex flex-col'>
      <Outlet />
      <Navbar />
    </div>
  );
};
