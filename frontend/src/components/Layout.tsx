import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-slate-900 font-sans selection:bg-maroon-100 selection:text-maroon-900">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};
