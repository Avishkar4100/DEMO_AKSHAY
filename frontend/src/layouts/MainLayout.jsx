import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/* ── Nav items — role visibility ────────────────────────────────── */
const ALL_NAV = [
  // label, path, icon (SVG path), roles that can see it, section
  {
    section: 'Main',
    items: [
      { path: '/dashboard',    label: 'Dashboard',    roles: ['admin','doctor','nurse','receptionist'], icon: 'chart-pie' },
      { path: '/patients',     label: 'Patients',     roles: ['admin','doctor','nurse','receptionist'], icon: 'users' },
      { path: '/appointments', label: 'Appointments', roles: ['admin','doctor','nurse','receptionist'], icon: 'calendar' },
    ],
  },
  {
    section: 'Clinical',
    roles: ['admin','doctor','nurse'],
    items: [
      { path: '/medical-records', label: 'Medical Records',  roles: ['admin','doctor','nurse'], icon: 'clipboard' },
      { path: '/prescriptions',   label: 'Prescriptions',    roles: ['admin','doctor','nurse'], icon: 'beaker' },
    ],
  },
  {
    section: 'Administration',
    roles: ['admin'],
    items: [
      { path: '/billing',  label: 'Billing',  roles: ['admin'], icon: 'currency' },
      { path: '/reports',  label: 'Reports',  roles: ['admin','doctor'], icon: 'chart-bar' },
      { path: '/settings', label: 'Settings', roles: ['admin'], icon: 'cog' },
    ],
  },
  {
    section: 'Account',
    items: [
      { path: '/profile', label: 'My Profile', roles: ['admin','doctor','nurse','receptionist'], icon: 'user' },
    ],
  },
];

/* ── SVG Icons ──────────────────────────────────────────────────── */
const icons = {
  'chart-pie': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  'users': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'calendar': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'clipboard': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  'beaker': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  'currency': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'chart-bar': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'cog': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'user': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  'logout': (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  'hospital': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  'menu': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  'home': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'chevron': (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  'sun': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  'moon': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
};

/* ── Role badge colours ─────────────────────────────────────────── */
const roleBadge = {
  admin:        'bg-amber-100 text-amber-800',
  doctor:       'bg-blue-100 text-blue-800',
  nurse:        'bg-emerald-100 text-emerald-800',
  receptionist: 'bg-purple-100 text-purple-800',
};

/* ── Helpers ────────────────────────────────────────────────────── */
function initials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Component ──────────────────────────────────────────────────── */
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // default open on desktop
  const [clock, setClock] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  /* Fetch logged-in user info from Flask session */
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUserInfo(data.user); })
      .catch(() => {});
  }, []);

  /* Live clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  /* Close sidebar on route change (mobile) */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/login';
  };

  const userRole = userInfo?.role ?? 'admin'; // fallback for demo
  const displayName = userInfo?.display_name ?? 'HMS User';
  const userAvatar = initials(displayName);

  /* Filter sections/items by role */
  const visibleSections = ALL_NAV.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(userRole)),
  })).filter(section => {
    if (section.roles && !section.roles.includes(userRole)) return false;
    return section.items.length > 0;
  });

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const currentPageLabel = (() => {
    for (const section of ALL_NAV) {
      const match = section.items.find(i => isActive(i.path));
      if (match) return match.label;
    }
    return 'Page';
  })();

  /* ── Sidebar content ────────────────────────────────────────── */
  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-0 lg:w-0';
  const sidebarClasses = sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:invisible';
  
  const Sidebar = () => (
    <aside
      id="main-sidebar"
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-64 lg:w-0'}
        sidebar-scroll overflow-y-auto overflow-x-hidden
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)', boxShadow: '4px 0 24px rgba(0,0,0,.2)' }}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                 style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)' }}>
              {icons['hospital']}
            </div>
            <div>
              <div className="text-white font-extrabold text-lg leading-tight tracking-tight">HMS</div>
              <div className="text-white/55 text-[10.5px] font-normal">Hospital Management</div>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/13 transition-all"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-3">
        {visibleSections.map((section) => (
          <div key={section.section}>
            <p className="px-3 pt-4 pb-1.5 text-[9.5px] font-bold uppercase tracking-widest text-white/38">
              {section.section}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5
                    text-[13.5px] font-medium transition-all duration-200 no-underline
                    relative
                    ${active
                      ? 'bg-white/20 text-white font-semibold shadow-sm'
                      : 'text-white/72 hover:bg-white/13 hover:text-white hover:translate-x-0.5'}
                  `}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-white rounded-r-full" />
                  )}
                  <span className={active ? 'opacity-100' : 'opacity-80'}>{icons[item.icon]}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card + Logout */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <Link to="/profile"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2 no-underline"
              style={{ background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.10)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
               style={{ background: 'rgba(255,255,255,.22)', border: '1.5px solid rgba(255,255,255,.3)' }}>
            {userAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[12.5px] font-semibold truncate">{displayName}</div>
            <div className="text-white/55 text-[10.5px] capitalize">{userRole}</div>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          id="nav-logout"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/13 hover:text-white text-[13.5px] font-medium transition-all duration-200"
        >
          {icons['logout']}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f5f6fa] dark:bg-slate-900 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content wrapper - independent scroll */}
      <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6
                           bg-white/97 dark:bg-slate-800/97 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm">

          {/* Left: toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle navigation"
              aria-controls="main-sidebar"
              aria-expanded={sidebarOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {sidebarOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                }
              </svg>
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <Link to="/dashboard" className="text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:flex items-center">
                {icons['home']}
              </Link>
              <span className="text-gray-300 dark:text-slate-600 hidden sm:block">{icons['chevron']}</span>
              <span className="font-semibold text-gray-800 dark:text-slate-100 text-[14px]">{currentPageLabel}</span>
            </nav>
          </div>

          {/* Right: theme toggle + clock + user + logout */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? icons['sun'] : icons['moon']}
            </button>

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-xs text-gray-500 dark:text-slate-400">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>{clock || 'Live'}</span>
            </div>

            {/* User chip */}
            <Link
              to="/profile"
              id="topbar-user"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all no-underline"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                   style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                {userAvatar}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-[13px] font-semibold text-gray-800 dark:text-slate-100 leading-tight">{displayName}</div>
                <div className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full inline-block capitalize ${roleBadge[userRole] ?? 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'}`}>
                  {userRole}
                </div>
              </div>
            </Link>

            {/* Logout */}
            <button
              id="topbar-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white dark:hover:text-white border border-indigo-100 dark:border-indigo-800 hover:border-indigo-600 dark:hover:border-indigo-600 text-[13px] font-semibold transition-all duration-200 shadow-sm"
            >
              {icons['logout']}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto h-0" role="main" id="page-main">
          <div className="p-5 lg:p-7 page-enter">
            <Outlet />
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="text-center py-3.5 text-xs text-gray-400 dark:text-slate-500 border-t border-gray-100 dark:border-slate-800">
          &copy; 2026 Hospital Management System &mdash; All rights reserved.
        </footer>
      </div>
    </div>
  );
}
