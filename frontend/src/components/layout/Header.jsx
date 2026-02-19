import React from 'react';
import { Bell, User, Settings, Command, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/auth';

const Header = () => {

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleNavigate = (path) => {
    navigate(path);
    setIsSettingsOpen(false);
  };

  const settingsActions = [
    { label: 'Platform Settings', icon: Settings, action: () => alert('Platform Settings - Coming Soon') },
    { label: 'Access Control', icon: User, action: () => handleNavigate('/users'), adminOnly: true },
    { label: 'Notification Logic', icon: Bell, action: () => alert('Notification Settings - Coming Soon') },
  ];
  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 px-8 flex items-center justify-between ml-64 transition-colors">
      <div className="flex items-center gap-4 text-muted-foreground">
        <Command className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-widest">Digital Trust Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button 
            className={`p-2 transition-colors ${isSettingsOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings className="w-5 h-5" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden py-1 fade-in">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Administrative Control</p>
              </div>
              {settingsActions
                .filter(action => !action.adminOnly || user?.role === UserRole.ADMIN)
                .map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium border-b border-border last:border-0"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  {action.label}
                </button>
              ))}
              <div className="bg-muted/30 px-4 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-[9px] font-bold text-destructive uppercase tracking-widest hover:text-destructive/80 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Terminal Logout
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">{user?.email || 'User Identification...'}</p>
            <p className="text-[10px] text-primary font-medium capitalize">{user?.role || 'Authenticating...'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
