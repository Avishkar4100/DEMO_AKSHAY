import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import { validators, validateField } from '../utils/validation';
import ValidatedInput from '../components/ValidatedInput';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '', remember_me: false });
  const [errors, setErrors] = useState({ username: null, password: null });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  // Real-time validation on change
  useEffect(() => {
    const uError = touched.username ? validateField(form.username, [
      validators.required,
      validators.username,
      validators.email,
    ], 'Username') : null;
    const pError = touched.password ? validateField(form.password, [
      validators.required,
      validators.minLength(6),
    ], 'Password') : null;
    setErrors({ username: uError, password: pError });
    setFormValid(
      form.username.trim().length > 0 && form.password.length > 0
    );
  }, [form.username, form.password, touched.username, touched.password]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'username' ? form.username : form.password;
    const rules = field === 'username'
      ? [validators.required, validators.username, validators.email]
      : [validators.required, validators.minLength(6)];
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(value, rules, field === 'username' ? 'Username' : 'Password'),
    }));
  };

  const inputClass = (field) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && form[field].length > 0;
    return `
      w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200
      ${hasError
        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
        : isValid
          ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
      }
      focus:ring-2 pr-10
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    const uError = validateField(form.username, [validators.required, validators.username, validators.email], 'Username');
    const pError = validateField(form.password, [validators.required, validators.minLength(6)], 'Password');
    setErrors({ username: uError, password: pError });
    if (uError || pError) return;
    setServerError('');
    setLoading(true);
    try {
      const res = await loginAPI.form(form);
      if (res.data.success) {
        navigate('/dashboard');
      } else {
        setServerError(res.data.error || 'Login failed');
      }
    } catch (err) {
      setServerError(err.response?.data?.error || 'Invalid credentials');
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

        {/* Server error banner */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username / Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-user text-indigo-400 mr-1.5"></i>
              Username or Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onBlur={() => handleBlur('username')}
                placeholder="e.g. admin@hms.local"
                className={inputClass('username')}
                required
                minLength={3}
                maxLength={50}
                autoComplete="username"
                autoFocus
              />
              {touched.username && form.username && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.username ? (
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  ) : (
                    <i className="fas fa-check-circle text-green-400"></i>
                  )}
                </span>
              )}
            </div>
            {touched.username && errors.username && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <i className="fas fa-info-circle"></i> {errors.username}
              </p>
            )}
            {touched.username && !errors.username && form.username && (
              <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <i className="fas fa-check"></i> Looks good!
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-lock text-indigo-400 mr-1.5"></i>
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password"
                className={inputClass('password')}
                required
                minLength={6}
                maxLength={128}
                autoComplete="current-password"
              />
              {touched.password && form.password && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.password ? (
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  ) : (
                    <i className="fas fa-check-circle text-green-400"></i>
                  )}
                </span>
              )}
            </div>
            {touched.password && errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <i className="fas fa-info-circle"></i> {errors.password}
              </p>
            )}
            {touched.password && !errors.password && form.password && (
              <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <i className="fas fa-check"></i> Password is valid
              </p>
            )}
          </div>

          {/* Remember me */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Sign in</>
            )}
          </button>
        </form>

        {/* Demo credentials */}
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
