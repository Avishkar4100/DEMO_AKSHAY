import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, setThemeMode } = useTheme();

  const handleThemeChange = (e) => {
    const value = e.target.value;
    if (value === 'light') setThemeMode('light');
    else if (value === 'dark') setThemeMode('dark');
    else {
      // System Default - follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
  };

  const getThemeValue = () => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return 'system';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage application settings and configurations</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,.3)] border border-gray-200 dark:border-slate-700 p-6 space-y-8">
        
        {/* General Settings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b dark:border-slate-700 pb-2">General Preferences</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Select application color theme</p>
              </div>
              <select value={getThemeValue()} onChange={handleThemeChange}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer">
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">Timezone</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Set your local timezone</p>
              </div>
              <select className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:border-indigo-500">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b dark:border-slate-700 pb-2">Notifications</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">Email Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Receive email for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="pt-4 flex justify-end">
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
