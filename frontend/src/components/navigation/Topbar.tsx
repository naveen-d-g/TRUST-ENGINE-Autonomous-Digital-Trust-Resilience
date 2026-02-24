import React, { useState, useRef, useEffect } from 'react';
import { Sun, Bell, Settings, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/demo');
  };
  return (
    <header className="h-16 border-b border-gray-800/40 bg-gray-900/10 flex items-center justify-between px-8 backdrop-blur-md">
      {/* Dashboard Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Digital Trust Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Action Icons */}
        <div className="flex items-center gap-6 text-gray-400">
           <Sun className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
           <div className="relative">
              <Bell className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#0A0E14] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
           </div>
           <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
        
        {/* User Profile */}
        <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-4 pl-6 border-l border-gray-800/60 cursor-pointer group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                     {user?.email || user?.username || 'GUEST'}
                  </span>
                  <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">
                     {user?.role || 'VIEWER'}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-center group-hover:bg-gray-800/60 transition-all">
                    <UserIcon className="w-4 h-4 text-gray-300" />
                 </div>
                 <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
               </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-4 w-64 bg-[#0A0D14] border border-gray-800/60 rounded-xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-800/60 bg-white/[0.02]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</div>
                    <div className="text-xs font-black text-white truncate">{user?.email || user?.username}</div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminal Logout
                    </button>
                  </div>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};
