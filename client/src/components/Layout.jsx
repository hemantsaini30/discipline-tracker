import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Today', icon: '⬡' },
  { to: '/tasks', label: 'Tasks', icon: '⬢' },
  { to: '/global', label: 'Global', icon: '◎' },
  { to: '/review', label: 'Review', icon: '◈' },
  { to: '/analytics', label: 'Analytics', icon: '◫' },
  { to: '/tomorrow', label: 'Tomorrow', icon: '▷' },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-bg-primary">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-52 bg-bg-secondary border-r border-border flex-col shrink-0 fixed h-full z-20">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-text-primary font-semibold text-sm tracking-wide">Discipline</div>
          <div className="text-text-muted text-xs mt-0.5 font-mono">Tracker</div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-bg-card text-text-primary border border-border'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`
              }
            >
              <span className="text-sm leading-none opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="text-text-secondary text-xs mb-2 truncate">{user?.name}</div>
          <button
            onClick={handleLogout}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-52 overflow-y-auto pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-bg-secondary border-b border-border px-4 h-12 flex items-center justify-between">
        <span className="text-text-primary text-sm font-semibold tracking-wide">Discipline</span>
        <span className="text-text-muted text-xs font-mono">{user?.name?.split(' ')[0]}</span>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-bg-secondary border-t border-border flex">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-all ${
                isActive ? 'text-text-primary' : 'text-text-muted'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-xs" style={{ fontSize: 10 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}