import { useState, useEffect } from 'react';
import { validators, validateField } from '../utils/validation';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'System Administrator',
    email: 'admin@hms.local',
    username: 'admin',
    department: 'IT Administration',
    phone: '+1 555-0001',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const userMeta = { role: 'admin', joined: 'Jan 2026' };

  // Real-time validation
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setErrors({
      name: touched.name ? validateField(form.name, [validators.required, validators.minLength(2)], 'Full name') : null,
      email: touched.email ? validateField(form.email, [validators.required, validators.email], 'Email') : null,
      username: touched.username ? validateField(form.username, [validators.required, validators.username], 'Username') : null,
      phone: touched.phone ? validateField(form.phone, [validators.phone], 'Phone') : null,
    });
  }, [form, touched]);

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const inputClass = (field) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && form[field];
    return `
      w-full px-3 py-2 border-2 rounded-lg text-sm outline-none transition-all duration-200
      ${hasError
        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
        : isValid
          ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
          : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
      }
      focus:ring-2
    `;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, username: true, phone: true });
    const errs = {
      name: validateField(form.name, [validators.required, validators.minLength(2)], 'Full name'),
      email: validateField(form.email, [validators.required, validators.email], 'Email'),
      username: validateField(form.username, [validators.required, validators.username], 'Username'),
      phone: validateField(form.phone, [validators.phone], 'Phone'),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setForm({ name: 'System Administrator', email: 'admin@hms.local', username: 'admin', department: 'IT Administration', phone: '+1 555-0001' });
    setErrors({}); setTouched({}); setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <i className="fas fa-user-circle text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-500 text-sm">Your account information</p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
            <i className="fas fa-edit mr-1.5"></i> Edit
          </button>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2 animate-fade-in">
          <i className="fas fa-check-circle"></i> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} noValidate>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Avatar header */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <i className="fas fa-user text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{form.name}</h2>
              <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                <i className="fas fa-user-tag text-indigo-400"></i> {userMeta.role}
              </p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <i className="fas fa-user text-indigo-400 mr-1"></i>Full Name
              </label>
              {editing ? (
                <div className="relative">
                  <input type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onBlur={() => handleBlur('name')}
                    className={inputClass('name')} required minLength={2} autoFocus />
                  {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">{form.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <i className="fas fa-envelope text-indigo-400 mr-1"></i>Email
              </label>
              {editing ? (
                <div>
                  <input type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onBlur={() => handleBlur('email')}
                    className={inputClass('email')} required inputMode="email" />
                  {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">{form.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <i className="fas fa-user-shield text-indigo-400 mr-1"></i>Username
              </label>
              {editing ? (
                <div>
                  <input type="text" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onBlur={() => handleBlur('username')}
                    className={inputClass('username')} required minLength={3} pattern="[a-zA-Z0-9._-]+"
                    title="Letters, numbers, dots, hyphens, underscores" />
                  {touched.username && errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">{form.username}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <i className="fas fa-phone text-indigo-400 mr-1"></i>Phone
              </label>
              {editing ? (
                <div>
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => handleBlur('phone')}
                    className={inputClass('phone')} inputMode="tel"
                    pattern="[\+\d\s\-\(\)\.]+" title="Enter a valid phone number" />
                  {touched.phone && errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">{form.phone}</p>
              )}
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <i className="fas fa-building text-indigo-400"></i> Department
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{form.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <i className="fas fa-calendar-alt text-indigo-400"></i> Member Since
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{userMeta.joined}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {editing && (
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button type="button" onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
                <i className="fas fa-save mr-1.5"></i> Save Changes
              </button>
            </div>
          )}
        </div>
      </form>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
