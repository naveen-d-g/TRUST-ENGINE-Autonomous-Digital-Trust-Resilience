import { NavLink } from "react-router-dom"
import { ShieldAlert, Activity, LayoutDashboard, Globe, Users, Settings, LogOut, LucideIcon } from "lucide-react"
import { usePermission } from "@/core/permissions/permissions"
import { authStore } from "@/store/authStore"
import clsx from "clsx"

const NavItem = ({ to, icon: Icon, label, action }: { to: string, icon: LucideIcon, label: string, action: string }) => {
  const hasPermission = usePermission(action)
  if (!hasPermission) return null

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
          isActive 
            ? "bg-neonBlue/10 text-neonBlue shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)] border border-neonBlue/20" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        )
      }
    >
      <Icon className="w-5 h-5 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
      <span className="font-medium">{label}</span>
    </NavLink>
  )
}

export const Sidebar = () => {
  const logout = authStore(state => state.logout)
  
  return (
    <aside className="w-64 bg-bgCard border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
          <ShieldAlert className="text-neonBlue" />
          TRUST<span className="text-neonBlue">ENGINE</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" action="VIEW_DASHBOARD" />
        <NavItem to="/soc" icon={ShieldAlert} label="SOC Incident Console" action="VIEW_INCIDENTS" />
        <NavItem to="/sessions" icon={Users} label="Session Explorer" action="VIEW_SESSIONS" />
        <NavItem to="/simulation" icon={Activity} label="Timeline Replay" action="SIMULATE" />
        <NavItem to="/intelligence" icon={Globe} label="Threat Intelligence" action="VIEW_DASHBOARD" />
        <NavItem to="/audit" icon={Settings} label="Access Audit" action="VIEW_AUDIT" />
        <NavItem to="/system-health" icon={Activity} label="System Health" action="VIEW_SYSTEM" />
        
        {/* Domain Section */}
        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Domain Defense
        </div>
        <NavItem to="/domain/web" icon={Globe} label="Web Security" action="VIEW_DASHBOARD" />
        <NavItem to="/domain/api" icon={Activity} label="API Security" action="VIEW_DASHBOARD" />
        <NavItem to="/domain/network" icon={ShieldAlert} label="Network Security" action="VIEW_DASHBOARD" />
        <NavItem to="/domain/system" icon={Settings} label="Infra Security" action="VIEW_DASHBOARD" />
      </nav>

      <div className="p-4 border-t border-gray-800">
         <button 
          onClick={logout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-neonRed hover:bg-neonRed/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
