
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
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
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
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 transition-colors overflow-y-auto custom-scrollbar">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldAlert className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight">
          Trust Engine <span className="text-primary block text-xs">AI Platform</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${item.indent ? 'ml-4 border-l-2 border-border pl-4' : ''}
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        {/* System Status */}
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

        {/* User Profile */}
        <div className="bg-muted/50 rounded-2xl p-4 border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
              <span className="text-xs font-black text-primary uppercase">{user?.email?.[0] || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tighter">{user?.email || 'Loading...'}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{user?.role || 'Identifying...'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2 bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg text-[10px] font-black uppercase tracking-widest border border-border hover:border-destructive/30 transition-all flex items-center justify-center gap-2"
          >
            Terminal Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
