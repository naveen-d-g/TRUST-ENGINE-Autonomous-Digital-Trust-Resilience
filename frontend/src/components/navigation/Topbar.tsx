import React from 'react';
import { Sun, Bell, Settings, User as UserIcon } from 'lucide-react';

export const Topbar: React.FC = () => {
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
        <div className="flex items-center gap-4 pl-6 border-l border-gray-800/60">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">viewer001@view</span>
              <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Viewer</span>
           </div>
           <div className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-center relative group cursor-pointer hover:bg-gray-800/60 transition-all">
              <UserIcon className="w-4 h-4 text-gray-300" />
           </div>
        </div>
      </div>
    </header>
  );
};
