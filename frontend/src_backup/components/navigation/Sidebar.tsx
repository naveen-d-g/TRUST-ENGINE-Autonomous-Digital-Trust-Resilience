import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Activity, 
  FileText, 
  History as HistoryIcon, 
  Globe, 
  Server, 
  Cpu, 
  Wifi,
  LayoutDashboard,
  Zap,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import clsx from 'clsx';
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

  const { stats } = useSocPolling();
  const systemStatus = stats?.system_status || 'ONLINE';

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col shadow-2xl relative z-20">
      <div className="p-6 flex items-center space-x-2 border-b border-border/50">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <ShieldAlert className="w-8 h-8 text-primary" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight">SOC v2</span>
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Trust Engine</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Main Navigation</span>
          <Activity className="w-3 h-3 opacity-30" />
        </div>
        
        <NavItem to="/" icon={LayoutDashboard} label="Home" />
        <NavItem to="/demo" icon={Activity} label="Live Login Demo" />
        <NavItem to="/simulation" icon={Zap} label="Attack Simulation" />

        <div className="mt-8 px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>SOC Operations</span>
          <ShieldAlert className="w-3 h-3 opacity-30" />
        </div>
        <NavItem to="/soc" icon={Activity} label="SOC Dashboard" />
        <NavItem to="/soc/incidents" icon={ShieldAlert} label="Incidents" />
        <NavItem to="/soc/proposals" icon={FileText} label="Proposals" />
        <NavItem to="/soc/sessions" icon={HistoryIcon} label="Session Explorer" />
        <NavItem to="/soc/batch" icon={ShieldAlert} label="Batch Audit" />
        <NavItem to="/soc/audit" icon={HistoryIcon} label="Audit Logs" />

        <div className="mt-8 px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Security Domains</span>
          <Globe className="w-3 h-3 opacity-30" />
        </div>
        <NavItem to="/domains/web" icon={Globe} label="Web Security" />
        <NavItem to="/domains/api" icon={Server} label="API Security" />
        <NavItem to="/domains/network" icon={Wifi} label="Network" />
        <NavItem to="/domains/system" icon={Cpu} label="System" />
      </nav>

      {/* System Health Section */}
      <div className="p-4 border-t border-border bg-black/20">
        <div className="mb-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex justify-between">
            <span>System Health</span>
            <span className={clsx(
              "flex items-center",
              systemStatus === 'ONLINE' ? "text-success" : "text-destructive"
            )}>
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                systemStatus === 'ONLINE' ? "bg-success" : "bg-destructive"
              )} />
              {systemStatus}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-success" />
                Core Guard
              </span>
              <span className="text-success font-mono">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-2 bg-muted/30 rounded border border-border/50">
           <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
             System Operator
           </span>
        </div>
      </div>
    </div>
  );
};
