import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Today', icon: '◈' },
  { to: '/tasks', label: 'Tasks', icon: '◧' },
  { to: '/global', label: 'Global', icon: '◎' },
  { to: '/review', label: 'Review', icon: '◉' },
  { to: '/analytics', label: 'Analytics', icon: '◫' },
  { to: '/tomorrow', label: 'Tomorrow', icon: '◷' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-56 bg-bg-secondary border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-text-primary font-semibold text-sm tracking-wide">Discipline</div>
          <div className="text-text-muted text-xs mt-0.5">Tracker</div>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-bg-card text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="text-text-secondary text-xs mb-2 truncate">{user?.name}</div>
          <button onClick={handleLogout} className="text-text-muted text-xs hover:text-text-secondary transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
