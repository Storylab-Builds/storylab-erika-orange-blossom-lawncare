import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  HardHat,
  MapPin,
  CloudSun,
  BarChart3,
  MessageSquare,
  Settings,
  Leaf,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  HardHat,
  MapPin,
  CloudSun,
  BarChart3,
  MessageSquare,
  Settings,
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/schedule': 'Schedule',
  '/crews': 'Crews',
  '/field': 'Field Operations',
  '/weather': 'Weather Intelligence',
  '/reports': 'Reports & Analytics',
  '/communications': 'Communications',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/customers/')) return 'Customer Detail';
  return pageTitles[pathname] || 'Dashboard';
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const initials = getInitials(user?.name ?? 'OBS');
  const roleLabel = user ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : '';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-900">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Mobile drawer backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 dark:bg-black/60 lg:hidden"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">OBS Lawncare</span>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath.startsWith(item.path);
            const Icon = iconMap[item.icon] || LayoutDashboard;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeDrawer}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-light text-primary dark:bg-primary/20 dark:text-primary-light'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name ?? 'Account'}</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-600 dark:text-gray-400 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
              {getPageTitle(currentPath)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-500 dark:text-gray-400 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
