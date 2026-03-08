
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../auth/AuthContext';
import { Loader2 } from 'lucide-react';

import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">AUTHENTICATING SESSION...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:block">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Header isCollapsed={isCollapsed} />
      <main className={`p-4 md:p-8 fade-in flex-1 transition-all duration-300 ml-0 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
