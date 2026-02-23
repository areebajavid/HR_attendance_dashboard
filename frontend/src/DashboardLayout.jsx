import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';

function DashboardLayout() {
  const auth     = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚀</div>
          <div>
            <div className="sidebar-logo-text">Innaccel</div>
            <div className="sidebar-logo-sub">Attendance Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="sidebar-label">Main</span>

          <NavLink
            to="/"
            end
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="nav-icon">📋</span>
            Daily Attendance
          </NavLink>

          <NavLink
            to="/balances"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="nav-icon">📊</span>
            Leave Balances
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="nav-icon">📈</span>
            Analytics
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">HR</div>
            <div>
              <div className="sidebar-user-name">HR Manager</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
