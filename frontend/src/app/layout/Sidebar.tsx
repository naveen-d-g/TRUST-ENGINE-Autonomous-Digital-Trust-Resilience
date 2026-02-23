import { NavLink } from "react-router-dom"
import { LayoutGrid, Search, ShieldCheck, FileStack, Activity, Crosshair, User, Users, Shield, Globe, Server, Wifi, Cpu, LucideIcon } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import clsx from "clsx"

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: LucideIcon, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
          isActive 
            ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
    </NavLink>
  )
}

export const Sidebar = () => {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  
  return (
    <aside className="w-64 bg-[#0A0E14] border-r border-gray-800/40 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-8 border-b border-gray-800/20">
        <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
             <Shield className="text-blue-500 w-5 h-5" />
          </div>
          <div className="flex flex-col">
             <span className="uppercase leading-none">Trust Engine</span>
             <span className="text-[8px] text-blue-400 tracking-[0.3em] font-black mt-0.5">AI Platform</span>
          </div>
        </h1>
      </div>

      <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem to="/" icon={LayoutGrid} label="Home" />
        <NavItem to="/dashboard" icon={Activity} label="Dashboard" />
        <NavItem to="/sessions" icon={Search} label="Session Explorer" />
        <NavItem to="/trust-eval" icon={ShieldCheck} label="Trust Evaluation" />
        <NavItem to="/batch" icon={FileStack} label="Batch Process" />
        <NavItem to="/simulation" icon={Crosshair} label="Attack Simulation" />
        <a 
          href="http://localhost:3001" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-emerald-400 hover:text-white hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20"
        >
          <User className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Live Login Demo</span>
        </a>
        <NavItem to="/users" icon={Users} label="User Management" />

        <div className="pt-6 pb-2 px-4">
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Operations</span>
        </div>
        <NavItem to="/live" icon={Activity} label="Live Attack Monitor" />
        
        <div className="pt-6 pb-2 px-4">
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Domains</span>
        </div>
        <NavItem to="/domain/web" icon={Globe} label="Web Security" />
        <NavItem to="/domain/api" icon={Server} label="API Integrity" />
        <NavItem to="/domain/network" icon={Wifi} label="Network Security" />
        <NavItem to="/domain/infra" icon={Cpu} label="System Security" />
      </nav>

      <div className="p-4 flex flex-col gap-4">
        {/* System Health Block */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl backdrop-blur-md">
           <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Core Health</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
           </div>
           <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SYSTEM ONLINE</span>
           </div>
        </div>

        {/* User Profile Block */}
        <div className="p-4 bg-gray-900/40 border border-gray-800/60 rounded-2xl">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                 <span className="font-black text-blue-400">V</span>
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{user?.email || "ADMIN@TRUSTENGINE.AI"}</span>
                 <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest italic">{user?.role || "ADMIN"}</span>
              </div>
           </div>
           
           <button 
             onClick={logout}
             className="w-full py-2.5 bg-gray-800/40 hover:bg-red-500/10 hover:text-red-400 border border-gray-700/50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
           >
             Terminal Logout
           </button>
        </div>
      </div>
    </aside>
  )
}
