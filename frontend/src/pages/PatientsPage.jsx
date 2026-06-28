import { useState, useEffect } from 'react';
import { validators, validateField } from '../utils/validation';
import ValidatedInput, { ValidatedSelect, Modal } from '../components/ValidatedInput';

export default function PatientsPage() {
  const [patients, setPatients] = useState([
    { id: 1, name: 'Alice Johnson', age: 34, gender: 'F', contact: '+1 555-0101', status: 'Active' },
    { id: 2, name: 'Bob Williams', age: 45, gender: 'M', contact: '+1 555-0102', status: 'Active' },
    { id: 3, name: 'Carol Davis', age: 28, gender: 'F', contact: '+1 555-0103', status: 'Inactive' },
    { id: 4, name: 'David Brown', age: 52, gender: 'M', contact: '+1 555-0104', status: 'Active' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: '', contact: '', status: 'Active' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setFieldErrors({
      name: touched.name ? validateField(form.name, [validators.required], 'Full name') : null,
      age: touched.age ? validateField(form.age, [validators.required, validators.age], 'Age') : null,
      gender: touched.gender ? validateField(form.gender, [validators.required], 'Gender') : null,
      contact: touched.contact ? validateField(form.contact, [validators.required, validators.phone], 'Contact') : null,
    });
  }, [form, touched]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resetForm = () => {
    setForm({ name: '', age: '', gender: '', contact: '', status: 'Active' });
    setFieldErrors({});
    setTouched({});
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Touch all fields
    setTouched({ name: true, age: true, gender: true, contact: true });
    const errs = {
      name: validateField(form.name, [validators.required], 'Full name'),
      age: validateField(form.age, [validators.required, validators.age], 'Age'),
      gender: validateField(form.gender, [validators.required], 'Gender'),
      contact: validateField(form.contact, [validators.required, validators.phone], 'Contact'),
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const newPatient = {
      id: patients.length + 1,
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      contact: form.contact.trim(),
      status: form.status,
    };
    setPatients((prev) => [...prev, newPatient]);
    setSaved(true);
    setTimeout(() => { setShowModal(false); resetForm(); }, 800);
  };

  const inputClass = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && form[field];
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

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center shadow-sm shrink-0">
            <i className="fas fa-users text-white text-lg"></i>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 text-xs md:text-sm">Manage patient records</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
        >
          <i className="fas fa-plus mr-1.5"></i> Add Patient
        </button>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2 animate-fade-in">
          <i className="fas fa-check-circle"></i> Patient added successfully!
        </div>
      )}

      {/* Responsive table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm tablet-responsive-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Name</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-cake-candles text-indigo-400 mr-1.5"></i>Age</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-venus-mars text-indigo-400 mr-1.5"></i>Gender</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap tablet-hide-col"><i className="fas fa-phone text-indigo-400 mr-1.5"></i>Contact</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600">{p.age}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600">{p.gender}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600 tablet-hide-col">{p.contact}</td>
                  <td className="px-3 md:px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <i className={`fas fa-circle text-[6px] ${p.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}></i>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium whitespace-nowrap">
                      <i className="fas fa-edit mr-1"></i>Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Add New Patient">
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-user text-indigo-400 mr-1.5"></i>Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text" value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. John Doe"
                className={inputClass('name')}
                minLength={2} maxLength={100}
                autoFocus
              />
              {touched.name && form.name && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {fieldErrors.name ? <i className="fas fa-exclamation-circle text-red-400"></i> : <i className="fas fa-check-circle text-green-400"></i>}
                </span>
              )}
            </div>
            {touched.name && fieldErrors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-cake-candles text-indigo-400 mr-1.5"></i>Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number" value={form.age} required
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  onBlur={() => handleBlur('age')}
                  placeholder="e.g. 34"
                  className={inputClass('age')}
                  min={0} max={150} inputMode="numeric"
                />
                {touched.age && form.age && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {fieldErrors.age ? <i className="fas fa-exclamation-circle text-red-400"></i> : <i className="fas fa-check-circle text-green-400"></i>}
                  </span>
                )}
              </div>
              {touched.age && fieldErrors.age && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-venus-mars text-indigo-400 mr-1.5"></i>Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                onBlur={() => handleBlur('gender')}
                className={inputClass('gender')}
                required
              >
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {touched.gender && fieldErrors.gender && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.gender}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-phone text-indigo-400 mr-1.5"></i>Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel" value={form.contact} required
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                onBlur={() => handleBlur('contact')}
                placeholder="e.g. +1 555-0101"
                className={inputClass('contact')}
                pattern="[\+\d\s\-\(\)\.]+" minLength={7} maxLength={20}
                inputMode="tel"
                title="Enter a valid phone number (digits, +, -, spaces, parentheses)"
              />
              {touched.contact && form.contact && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {fieldErrors.contact ? <i className="fas fa-exclamation-circle text-red-400"></i> : <i className="fas fa-check-circle text-green-400"></i>}
                </span>
              )}
            </div>
            {touched.contact && fieldErrors.contact && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.contact}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <i className="fas fa-save mr-1.5"></i> Save Patient
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
