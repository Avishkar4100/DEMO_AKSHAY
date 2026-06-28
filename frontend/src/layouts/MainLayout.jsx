import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
  { path: '/patients', label: 'Patients', icon: 'fa-users' },
  { path: '/appointments', label: 'Appointments', icon: 'fa-calendar-check' },
  { path: '/billing', label: 'Billing', icon: 'fa-file-invoice-dollar' },
  { path: '/profile', label: 'Profile', icon: 'fa-user-circle' },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/logout');
    } catch {}
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for tablet + mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on < xl (tablet), visible on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out xl:relative xl:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
              <i className="fas fa-hospital text-white text-sm"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-indigo-600 leading-tight">HMS</h1>
              <p className="text-[10px] text-gray-400 leading-tight">Hospital Management</p>
            </div>
          </Link>
        </div>
        <nav className="mt-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center text-sm ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400'}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5 text-center text-sm text-gray-400"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar (mobile + tablet) - hidden on desktop */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 xl:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <i className="fas fa-hospital text-white text-xs"></i>
            </div>
            <span className="font-bold text-gray-800">HMS</span>
          </div>
          {/* Spacer + optional status on tablet */}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400">
              <i className="fas fa-circle text-[6px] text-green-400"></i>
              Live
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 md:p-5 xl:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
