
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Search, 
  FormInput, 
  UploadCloud, 
  Activity,
  ShieldCheck,
  Bot,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crosshair
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useAppContext } from '../../context/AppContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { systemHealth } = useAppContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: ShieldCheck, roles: ['admin', 'analyst', 'viewer'] },
    
    // Analyst & Admin Tools
    { name: 'Live Monitoring', path: '/live', icon: Activity, roles: ['admin', 'analyst', 'viewer'] },
    { name: 'SOC Dashboard', path: '/soc', icon: LayoutDashboard, roles: ['admin', 'analyst'] },
    
    // Domain Security (Analyst/Admin)
    { name: 'Web Security', path: '/soc/web', icon: ShieldCheck, indent: true, roles: ['admin', 'analyst'] },
    { name: 'API Security', path: '/soc/api', icon: ShieldCheck, indent: true, roles: ['admin', 'analyst'] },
    { name: 'Network Security', path: '/soc/network', icon: ShieldCheck, indent: true, roles: ['admin', 'analyst'] },
    { name: 'Infra Security', path: '/soc/infra', icon: ShieldCheck, indent: true, roles: ['admin', 'analyst'] },

    { name: 'Session Explorer', path: '/sessions', icon: Search, roles: ['admin', 'analyst'] },
    { name: 'Batch Audit', path: '/soc/batch', icon: UploadCloud, roles: ['admin', 'analyst'] },
    { name: 'Attack Surface', path: '/attack-surface', icon: Crosshair, roles: ['admin', 'analyst'] },

    // Demo / Simulation (Everyone/Viewer+)
    // Note: Matrix says Viewer gets Demo/Sim. Admin gets All. Analyst usually gets these too.
    { name: 'Live Login Demo', path: '/demo', icon: User, roles: ['admin', 'analyst', 'viewer'] },
    { name: 'Attack Simulation', path: '/simulation', icon: Bot, roles: ['admin', 'analyst', 'viewer'] },
    
    // Admin Only
    { name: 'Admin', path: '/users', icon: User, roles: ['admin'] },
  ];

  // Filter based on current user role
  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={`bg-card border-b md:border-r border-border flex flex-col md:h-screen md:fixed left-0 top-0 transition-all duration-300 z-20 flex-shrink-0 ${
      isCollapsed ? 'w-full md:w-20' : 'w-full md:w-64'
    }`}>
      <div className={`p-4 md:p-6 flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <ShieldAlert className="text-primary w-6 h-6" />
        </div>
        {!isCollapsed && (
          <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight hidden md:block">
            Trust Engine <span className="text-primary block text-xs">AI Platform</span>
          </h1>
        )}
        <h1 className="text-lg font-bold tracking-tight text-foreground md:hidden uppercase tracking-widest text-[11px] whitespace-nowrap">
          Trust Engine
        </h1>
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-border rounded-full items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors z-30 shadow-lg ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto px-4 py-2 space-x-2 md:space-x-0 md:space-y-1 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap
              ${item.indent && !isCollapsed ? 'md:ml-4 md:border-l-2 border-border md:pl-4' : ''}
              ${isCollapsed ? 'justify-center md:px-0' : ''}
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
            `}
            title={item.name}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm hidden md:inline">{item.name}</span>}
          </NavLink>
        ))}
        {/* Mobile Logout Button */}
        <button 
            onClick={handleLogout}
            className="md:hidden flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
            title="Logout"
        >
            <LogOut className="w-5 h-5 flex-shrink-0" />
        </button>
      </nav>

      <div className={`hidden md:block p-4 space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
        {/* System Status */}
        {!isCollapsed && (
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">System Health</span>
              <div className={`w-1.5 h-1.5 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-success' : 'bg-destructive'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`} />
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {systemHealth?.status === 'healthy' ? 'Core Online' : 'Latency Detected'}
              </span>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className={`bg-muted/50 rounded-2xl p-4 border border-border space-y-3 ${isCollapsed ? 'p-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center mx-auto' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border flex-shrink-0">
              <span className="text-xs font-black text-primary uppercase">{user?.email?.[0] || '?'}</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tighter">{user?.email || 'Loading...'}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{user?.role || 'Identifying...'}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="w-full py-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg text-[10px] font-black uppercase tracking-widest border border-border hover:border-destructive/30 transition-all flex items-center justify-center gap-2"
            >
              Terminal Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
