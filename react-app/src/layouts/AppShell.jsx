import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtilityMascot } from '../components/UtilityMascot';

const navMap = {
  HOUSEHOLD_MEMBER: [
    ['Dashboard', '/dashboard'], ['Household', '/household'], ['Bills', '/bills'], ['Customer care', '/customer-care'],
    ['Account services', '/account-services'], ['Usage', '/usage'], ['Payments', '/payments'],
    ['Autopay', '/autopay'], ['Predictions', '/predictions'], ['Disputes', '/disputes'],
    ['Notifications', '/notifications'], ['Loyalty', '/loyalty'], ['Profile', '/profile'],
  ],
  HOUSEHOLD_ADMIN: [
    ['Dashboard', '/dashboard'], ['Household', '/household'], ['Customer care', '/customer-care'],
    ['Account services', '/account-services'], ['Members', '/members'], ['Utilities', '/utilities'],
    ['Bills', '/bills'], ['Splits', '/splits'], ['Autopay', '/autopay'], ['Disputes', '/disputes'],
    ['Reports', '/reports'],
  ],
  PLATFORM_ADMIN: [
    ['Overview', '/admin'], ['Users', '/admin/users'], ['Households', '/admin/households'],
    ['Bills', '/admin/bills'], ['Payments', '/admin/payments'], ['Disputes', '/admin/disputes'],
    ['Reports', '/admin/reports'],
  ],
};

const dashboardNav = {
  HOUSEHOLD_MEMBER: [['Dashboard', '/dashboard'], ['Household', '/household'], ['Bills', '/bills'], ['Payments', '/payments'], ['Analytics', '/usage'], ['Settings', '/profile']],
  HOUSEHOLD_ADMIN: [['Dashboard', '/dashboard'], ['Bills', '/bills'], ['Split Bill', '/splits'], ['Payments', '/payments'], ['Analytics', '/usage'], ['Settings', '/profile']],
  PLATFORM_ADMIN: [['Dashboard', '/dashboard'], ['Bills', '/admin/bills'], ['Payments', '/admin/payments'], ['Analytics', '/admin/reports'], ['Settings', '/profile']],
};

const navIcons = {
  Dashboard: '⌂', Overview: '◈', Bills: '▤', 'Split Bill': '⇄', Splits: '⇄', Payments: '↗',
  Analytics: '◔', Settings: '⚙', Household: '⌂', 'Customer care': '✦', 'Account services': '▣',
  Members: '♙', Utilities: 'ϟ', Autopay: '⟳', Predictions: '◇', Disputes: '⚖',
  Notifications: '♧', Loyalty: '✧', Profile: '◉', Users: '♙', Households: '⌂', Reports: '▥',
};

const routeNames = [
  [/^\/dashboard$/, 'Dashboard'], [/^\/bills\/[^/]+$/, 'Bill details'], [/^\/bills$/, 'Bills'],
  [/^\/usage$/, 'Analytics'], [/^\/payments$/, 'Payments'], [/^\/customer-care$/, 'Customer care'],
  [/^\/account-services$/, 'Account services'], [/^\/autopay$/, 'Autopay'], [/^\/predictions$/, 'Predictions'],
  [/^\/disputes$/, 'Disputes'], [/^\/notifications$/, 'Notifications'], [/^\/loyalty$/, 'Loyalty'],
  [/^\/profile$/, 'Settings'], [/^\/household$/, 'Household'], [/^\/members$/, 'Members'],
  [/^\/utilities$/, 'Utilities'], [/^\/splits$/, 'Split Bill'], [/^\/reports$/, 'Reports'],
  [/^\/admin\/users$/, 'Users'], [/^\/admin\/households$/, 'Households'], [/^\/admin\/bills$/, 'Bills'],
  [/^\/admin\/payments$/, 'Payments'], [/^\/admin\/disputes$/, 'Disputes'], [/^\/admin\/reports$/, 'Analytics'], [/^\/admin$/, 'Admin overview'],
];

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    try { return window.localStorage.getItem('paymate-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  const isDashboard = location.pathname === '/dashboard';
  const navItems = navMap[user?.role] || navMap.HOUSEHOLD_MEMBER;
  const visibleNavItems = isDashboard ? dashboardNav[user?.role] || dashboardNav.HOUSEHOLD_MEMBER : navItems;
  const mobileNavItems = isDashboard
    ? visibleNavItems.slice(0, 5)
    : navItems.filter(([, path]) => ['/dashboard', '/household', '/bills', '/payments', '/splits', '/profile', '/admin'].includes(path)).slice(0, 5);
  const pageTitle = routeNames.find(([pattern]) => pattern.test(location.pathname))?.[1] || 'Control center';
  const mascotKind = /^\/(bills|utilities|usage)/.test(location.pathname)
    ? 'water'
    : /^\/(payments|splits|autopay)/.test(location.pathname)
      ? 'electricity'
      : 'internet';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openSpy = () => window.dispatchEvent(new Event('spy-assistant:open'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('paymate-theme', theme); } catch { /* Keep the selected theme for this session. */ }
  }, [theme]);

  return (
    <div className={`app-shell pm-robot-shell ${isDashboard ? 'is-dashboard' : ''}`}>
      <div className="app-ambient" aria-hidden="true"><div className="app-floating-sticker"><UtilityMascot kind={mascotKind} /><i>✦</i></div></div>
      <header className="pm-dashboard-header pm-global-header">
        <Link to="/dashboard" className="pm-dashboard-brand" aria-label="PayMate dashboard">
          <span className="pm-dashboard-brand-mark"><i /><b /><em /></span>
          <span className="pm-brand-copy"><strong>PAYMATE</strong><small>SMART UTILITY CONTROL</small></span>
        </Link>
        <div className="pm-dashboard-header-actions">
          <span className="pm-system-status"><i /> ROBOT ONLINE</span>
          <button type="button" className="pm-header-spy" onClick={openSpy}><span aria-hidden="true">✳</span> Ask Spy</button>
          <button type="button" className="pm-theme-toggle" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-pressed={theme === 'light'}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
          <Link to="/notifications" aria-label="Notifications">🔔</Link>
          <Link to="/profile" className="pm-dashboard-profile"><span aria-hidden="true">👤</span> Profile</Link>
        </div>
      </header>

      <aside className="sidebar">
        <div className="pm-sidebar-label">{isDashboard ? 'WORKSPACE' : 'NAVIGATION'}</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {visibleNavItems.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === '/dashboard' || path === '/admin'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="pm-nav-icon" aria-hidden="true">{navIcons[label] || '◈'}</span><span>{label}</span><span className="pm-nav-light" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-chip">
            <div className="avatar">{user?.name?.[0] || 'U'}</div>
            <div><strong>{user?.name || 'User'}</strong><small>{user?.role?.replaceAll('_', ' ') || 'Member'}</small></div>
            <span className="pm-profile-presence" aria-label="Online" />
          </div>
          <button className="ghost-button" onClick={handleLogout}><span aria-hidden="true">↪</span> Logout</button>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar pm-routebar">
          <div><div className="eyebrow">PAYMATE <span>/</span> CONTROL DECK</div><h2>{pageTitle}</h2></div>
          <span className="pm-route-state"><i /> {isDashboard ? 'All systems ready' : 'Secure session active'}</span>
        </header>
        {children}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {mobileNavItems.map(([label, path]) => (
          <NavLink key={path} to={path} end={path === '/dashboard' || path === '/admin'} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <span aria-hidden="true">{navIcons[label] || '◈'}</span><small>{label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
