import React from 'react';
import { User as UserIcon, Building } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center">
          <div className="flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <Building className="w-3 h-3 mr-2" />
              Intelligence Node: Global
          </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col text-right hidden md:block">
            <span className="text-sm font-medium">Digital Operator</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Command Access</span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <UserIcon className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
};
