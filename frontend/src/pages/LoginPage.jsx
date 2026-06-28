import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '', remember_me: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAPI.form(form);
      if (res.data.success) {
        navigate('/dashboard');
      } else {
        setError(res.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 dark:from-indigo-900 dark:to-purple-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">🏥 HMS</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={form.remember_me}
              onChange={(e) => setForm({ ...form, remember_me: e.target.checked })}
              className="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-sm text-gray-600 dark:text-slate-400">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">DEMO CREDENTIALS</p>
          <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1">
            <p>👤 admin@hms.local / Admin@12345</p>
            <p>👨‍⚕️ doctor@hms.local / Doctor@12345</p>
            <p>👩‍⚕️ nurse@hms.local / Nurse@12345</p>
            <p>📞 receptionist@hms.local / Recep@12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
