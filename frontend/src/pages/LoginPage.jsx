import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import { FormField, FormCheckbox, FormAlert } from '../components';
import Button from '../components/Button';
import { validators, validateField } from '../utils/validation';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '', remember_me: false });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const rules = field === 'username'
      ? [validators.required]
      : [validators.required, validators.minLength(6)];
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(form[field], rules, field === 'username' ? 'Username' : 'Password'),
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const rules = field === 'username'
        ? [validators.required, validators.username, validators.email]
        : [validators.required, validators.minLength(6)];
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(value, rules, field === 'username' ? 'Username' : 'Password'),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    const uErr = validateField(form.username, [validators.required], 'Username');
    const pErr = validateField(form.password, [validators.required, validators.minLength(6)], 'Password');
    setErrors({ username: uErr, password: pErr });
    if (uErr || pErr) return;
    setServerError('');
    setLoading(true);
    try {
      const res = await loginAPI.form(form);
      if (res.data.success) navigate('/dashboard');
      else setServerError(res.data.error || 'Login failed');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Invalid credentials');
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

        {serverError && (
          <FormAlert variant="error" message={serverError} dismissible onDismiss={() => setServerError('')} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField
            label="Username or Email"
            icon="fa-user"
            placeholder="e.g. admin@hms.local"
            required
            autoComplete="username"
            autoFocus
            minLength={3}
            maxLength={50}
            value={form.username}
            onChange={(v) => handleChange('username', v)}
            onBlur={() => handleBlur('username')}
            rules={[validators.required, validators.username, validators.email]}
          />

          <FormField
            label="Password"
            icon="fa-lock"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            minLength={6}
            maxLength={128}
            value={form.password}
            onChange={(v) => handleChange('password', v)}
            onBlur={() => handleBlur('password')}
            rules={[validators.required, validators.minLength(6)]}
          />

          <FormCheckbox
            label="Remember me on this device"
            checked={form.remember_me}
            onChange={(val) => setForm((prev) => ({ ...prev, remember_me: val }))}
          />

          <Button type="submit" loading={loading} icon="fa-sign-in-alt" fullWidth>
            Sign in
          </Button>
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
