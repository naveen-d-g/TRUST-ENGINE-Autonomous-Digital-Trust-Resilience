import { NavLink } from "react-router-dom"
import { LayoutGrid, Search, ShieldCheck, FileStack, Activity, Crosshair, User, Users, Shield, Globe, Server, Wifi, Cpu, LucideIcon, ChevronLeft, Target } from "lucide-react"
import clsx from "clsx"

const NavItem = ({ to, icon: Icon, label, isCollapsed }: { to: string, icon: LucideIcon, label: string, isCollapsed?: boolean }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
          isCollapsed ? "justify-center px-0 mx-2" : "",
          isActive 
            ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )
      }
      title={isCollapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest truncate">{label}</span>}
    </NavLink>
  )
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (val: boolean) => void }) => {
  return (
    <aside className={`bg-[#0A0E14] border-r border-gray-800/40 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-6 border-b border-gray-800/20 flex items-center relative ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-blue-600/20 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
             <Shield className="text-blue-500 w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
               <span className="uppercase leading-none text-xl font-black text-white tracking-tighter">Trust Engine</span>
               <span className="text-[8px] text-blue-400 tracking-[0.3em] font-black mt-0.5">AI Platform</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-8 w-6 h-6 bg-gray-800 border-gray-700 border rounded-full hidden md:flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-all z-30 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <NavItem to="/" icon={LayoutGrid} label="Home" isCollapsed={isCollapsed} />
        <NavItem to="/dashboard" icon={Activity} label="Dashboard" isCollapsed={isCollapsed} />
        <NavItem to="/sessions" icon={Search} label="Session Explorer" isCollapsed={isCollapsed} />
        <NavItem to="/trust-eval" icon={ShieldCheck} label="Trust Evaluation" isCollapsed={isCollapsed} />
        <NavItem to="/batch" icon={FileStack} label="Batch Process" isCollapsed={isCollapsed} />
        <NavItem to="/simulation" icon={Crosshair} label="Attack Simulation" isCollapsed={isCollapsed} />
        <a 
          href="http://localhost:3001" 
          target="_blank" 
          rel="noopener noreferrer"
          className={clsx(
            "flex items-center space-x-3 py-3 rounded-lg transition-all duration-200 group text-gray-400 hover:text-white hover:bg-white/5",
            isCollapsed ? "justify-center px-0 mx-2" : "px-4"
          )}
          title={isCollapsed ? "Live Login Demo" : undefined}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest truncate">Live Login Demo</span>}
        </a>
        <NavItem to="/users" icon={Users} label="User Management" isCollapsed={isCollapsed} />

        {!isCollapsed ? (
          <div className="pt-6 pb-2 px-4 whitespace-nowrap overflow-hidden">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Operations</span>
          </div>
        ) : <div className="h-6" />}
        <NavItem to="/live" icon={Activity} label="Live Attack Monitor" isCollapsed={isCollapsed} />
        <NavItem to="/attack-surface" icon={Target} label="Attack Surface" isCollapsed={isCollapsed} />
        
        {!isCollapsed ? (
          <div className="pt-6 pb-2 px-4 whitespace-nowrap overflow-hidden">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Domains</span>
          </div>
        ) : <div className="h-6" />}
        <NavItem to="/domain/web" icon={Globe} label="Web Security" isCollapsed={isCollapsed} />
        <NavItem to="/domain/api" icon={Server} label="API Integrity" isCollapsed={isCollapsed} />
        <NavItem to="/domain/network" icon={Wifi} label="Network Security" isCollapsed={isCollapsed} />
        <NavItem to="/domain/infra" icon={Cpu} label="System Security" isCollapsed={isCollapsed} />
      </nav>

    </aside>
  )
}
