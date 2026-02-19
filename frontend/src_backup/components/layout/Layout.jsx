
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../auth/AuthContext';
import { Loader2 } from 'lucide-react';

import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">AUTHENTICATING SESSION...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <Header />
      <main className="ml-64 p-8 fade-in">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
