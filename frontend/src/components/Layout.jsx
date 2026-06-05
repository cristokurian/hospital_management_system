import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Users, 
  CalendarRange, 
  UserCircle2, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Activity
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Hospitals', path: '/admin/hospitals', icon: Building2 },
          { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Patients', path: '/admin/patients', icon: Users },
        ];
      case 'DOCTOR':
        return [
          { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
          { name: 'Manage Schedules', path: '/doctor/schedules', icon: CalendarRange },
          { name: 'My Profile', path: '/doctor/profile', icon: UserCircle2 },
        ];
      case 'PATIENT':
        return [
          { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
          { name: 'Find Doctors & Book', path: '/patient/search', icon: Stethoscope },
          { name: 'My Profile', path: '/patient/profile', icon: UserCircle2 },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="p-2.5 bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/35">
          <Activity size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">CareFlow</h1>
          <span className="text-[10px] font-semibold tracking-wider text-primary-500 uppercase">Healthcare OS</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 border-l-4 border-primary-500 pl-3' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-900'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
        {/* Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-3">
            {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">Theme</span>
        </button>

        {/* Logged in User info */}
        {user && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.firstName} {user.lastName}</span>
            <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold">{user.role}</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* Mobile Top Navbar Header */}
      <header className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-500 rounded-lg text-white">
            <Activity size={18} />
          </div>
          <span className="font-bold text-lg text-slate-950 dark:text-white">CareFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg"
          >
            {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Overlay and Menu Panel) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-80 max-w-xs flex-1 flex flex-col bg-white dark:bg-slate-900 h-full animate-slide-in">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
