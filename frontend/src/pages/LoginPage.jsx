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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <i className="fas fa-hospital text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold brand-gradient">HMS</h1>
          <p className="text-gray-500 mt-2">Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={form.remember_me}
              onChange={(e) => setForm({ ...form, remember_me: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
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

        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-xs font-semibold text-indigo-600 mb-2">
            <i className="fas fa-info-circle mr-1"></i> DEMO CREDENTIALS
          </p>
          <div className="text-xs text-indigo-500 space-y-1.5">
            <p><i className="fas fa-user-shield w-4 text-center"></i> admin@hms.local / Admin@12345</p>
            <p><i className="fas fa-user-md w-4 text-center"></i> doctor@hms.local / Doctor@12345</p>
            <p><i className="fas fa-user-nurse w-4 text-center"></i> nurse@hms.local / Nurse@12345</p>
            <p><i className="fas fa-headset w-4 text-center"></i> receptionist@hms.local / Recep@12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
