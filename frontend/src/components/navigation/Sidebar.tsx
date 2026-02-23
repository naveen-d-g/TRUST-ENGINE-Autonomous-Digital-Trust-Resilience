import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  Shield,
  ShieldAlert,
  Activity,
  FileText,
  History as HistoryIcon,
  Globe,
  Server,
  Cpu,
  Wifi,
  Zap,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { useSocPolling } from '../../hooks/useSocPolling';

export const Sidebar: React.FC = () => {
  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: LucideIcon, label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "relative flex items-center px-4 py-3 text-sm font-medium transition-all duration-300",
        isActive 
          ? "bg-primary/10 text-primary border-r-2 border-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive && (
            <motion.div 
              layoutId="activeGlow"
              className="absolute inset-0 bg-primary/5 blur-sm -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center"
          >
            <Icon className={clsx("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
            {label}
          </motion.div>
        </>
      )}
    </NavLink>
  );

  useSocPolling();

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col shadow-2xl relative z-20">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.1)]">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-white uppercase leading-none">Trust Engine</span>
          <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1">AI Platform</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Main Navigation</span>
          <Activity className="w-3 h-3 opacity-30" />
        </div>
        
        <NavItem to="/" icon={Shield} label="Home" />
        <NavItem to="/demo" icon={Activity} label="Live Login Demo" />
        <NavItem to="/simulation" icon={Zap} label="Attack Simulation" />

        <div className="mt-8 px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>SOC Operations</span>
          <ShieldAlert className="w-3 h-3 opacity-30" />
        </div>
        <NavItem to="/dashboard" icon={Zap} label="Main Dashboard" />
        <NavItem to="/soc" icon={Activity} label="SOC Monitor" />
        <NavItem to="/trust-eval" icon={ShieldCheck} label="Trust Evaluation" />
        <NavItem to="/soc/incidents" icon={ShieldAlert} label="Incidents" />
        <NavItem to="/soc/proposals" icon={FileText} label="Proposals" />
        <NavItem to="/sessions" icon={HistoryIcon} label="Session Explorer" />
        <NavItem to="/soc/batch" icon={ShieldAlert} label="Batch Audit" />
        <NavItem to="/soc/audit" icon={HistoryIcon} label="Audit Logs" />

        <div className="mt-8 px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Security Domains</span>
          <Globe className="w-3 h-3 opacity-30" />
        </div>
        <NavItem to="/domain/web" icon={Globe} label="Web Security" />
        <NavItem to="/domain/api" icon={Server} label="API Security" />
        <NavItem to="/domain/network" icon={Wifi} label="Network" />
        <NavItem to="/domain/system" icon={Cpu} label="System" />
      </nav>

      {/* System Status & User Section */}
      <div className="p-4 flex flex-col gap-4">
        {/* System Health */}
        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex justify-between items-center">
            <span>System Health</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Core Online</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 bg-gray-900/40 border border-gray-800/60 rounded-xl">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                 <span className="text-[10px] font-black text-blue-400">V</span>
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">Viewer001@view</span>
                 <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Viewer</span>
              </div>
           </div>
           
           <button 
              className="w-full py-2 bg-gray-800/40 hover:bg-red-500/10 hover:text-red-400 border border-gray-700/50 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 group"
           >
              Terminal Logout
           </button>
        </div>
      </div>
    </div>
  );
};
