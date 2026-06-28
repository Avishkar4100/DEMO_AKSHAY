import { useState, useEffect } from 'react';
import { validators, validateField } from '../utils/validation';
import { Modal } from '../components/ValidatedInput';

const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance', 'Bank Transfer', 'Online'];
const PATIENTS_LIST = ['Alice Johnson', 'Bob Williams', 'Carol Davis', 'David Brown', 'Eve Martin'];

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Overdue: 'bg-red-100 text-red-700',
};

export default function BillingPage() {
  const [bills, setBills] = useState([
    { id: 'INV-001', patient: 'Alice Johnson', amount: 250.00, date: '2026-06-27', method: 'Cash', status: 'Paid' },
    { id: 'INV-002', patient: 'Bob Williams', amount: 1500.00, date: '2026-06-26', method: 'Insurance', status: 'Pending' },
    { id: 'INV-003', patient: 'Carol Davis', amount: 750.00, date: '2026-06-25', method: 'Card', status: 'Paid' },
    { id: 'INV-004', patient: 'David Brown', amount: 3200.00, date: '2026-06-24', method: 'Insurance', status: 'Overdue' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', amount: '', date: '', method: '', status: 'Pending' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    setFieldErrors({
      patient: touched.patient ? validateField(form.patient, [validators.required], 'Patient') : null,
      amount: touched.amount ? validateField(form.amount, [validators.required, validators.positiveNumber], 'Amount') : null,
      date: touched.date ? validateField(form.date, [validators.required], 'Date') : null,
      method: touched.method ? validateField(form.method, [validators.required], 'Payment method') : null,
    });
  }, [form, touched]);

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const resetForm = () => {
    setForm({ patient: '', amount: '', date: '', method: '', status: 'Pending' });
    setFieldErrors({}); setTouched({}); setSaved(false);
  };

  const inputClass = (field) => {
    const hasError = touched[field] && fieldErrors[field];
    const isValid = touched[field] && !fieldErrors[field] && form[field];
    return `
      w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200 appearance-none
      ${hasError ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
        : isValid ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
      focus:ring-2 pr-10
    `;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({ patient: true, amount: true, date: true, method: true });
    const errs = {
      patient: validateField(form.patient, [validators.required], 'Patient'),
      amount: validateField(form.amount, [validators.required, validators.positiveNumber], 'Amount'),
      date: validateField(form.date, [validators.required], 'Date'),
      method: validateField(form.method, [validators.required], 'Payment method'),
    };
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const invNum = `INV-${String(bills.length + 1).padStart(3, '0')}`;
    const newBill = {
      id: invNum, ...form,
      amount: parseFloat(form.amount),
      status: form.status,
    };
    setBills((prev) => [...prev, newBill]);
    setSaved(true);
    setTimeout(() => { setShowModal(false); resetForm(); }, 800);
  };

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 items-center justify-center shadow-sm shrink-0">
            <i className="fas fa-file-invoice-dollar text-white text-lg"></i>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-500 text-xs md:text-sm">Invoices and payment tracking</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
        >
          <i className="fas fa-plus mr-1.5"></i> New Invoice
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2 animate-fade-in">
          <i className="fas fa-check-circle"></i> Invoice {bills[bills.length - 1]?.id} created successfully!
        </div>
      )}

      {/* Summary cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-dollar-sign text-green-500"></i>
            <p className="text-xs md:text-sm text-gray-500">Total Revenue</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-hourglass-half text-amber-500"></i>
            <p className="text-xs md:text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-amber-600">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-receipt text-indigo-500"></i>
            <p className="text-xs md:text-sm text-gray-500">Total Invoices</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{bills.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm tablet-responsive-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-hashtag text-indigo-400 mr-1.5"></i>Invoice</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-dollar-sign text-indigo-400 mr-1.5"></i>Amount</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap tablet-hide-col"><i className="fas fa-credit-card text-indigo-400 mr-1.5"></i>Payment</th>
                <th className="text-left px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status</th>
                <th className="text-right px-3 md:px-4 py-3 font-medium text-gray-600 whitespace-nowrap"><i className="fas fa-cog text-indigo-400 mr-1.5"></i>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-3 font-medium text-xs md:text-sm">{b.id}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600">{b.patient}</td>
                  <td className="px-3 md:px-4 py-3 font-medium whitespace-nowrap">${b.amount.toFixed(2)}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600 whitespace-nowrap">{b.date}</td>
                  <td className="px-3 md:px-4 py-3 text-gray-600 tablet-hide-col">{b.method}</td>
                  <td className="px-3 md:px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                      <i className={`fas fa-circle text-[6px] ${
                        b.status === 'Paid' ? 'text-green-500' :
                        b.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                      }`}></i>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-right space-x-1.5 md:space-x-2 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-800 text-xs md:text-sm font-medium">
                      <i className="fas fa-eye mr-0.5 md:mr-1"></i>View
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-xs md:text-sm font-medium">
                      <i className="fas fa-print mr-0.5 md:mr-1"></i>Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* New Invoice Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Create New Invoice">
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-user text-indigo-400 mr-1.5"></i>Patient <span className="text-red-500">*</span>
            </label>
            <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}
              onBlur={() => handleBlur('patient')} className={inputClass('patient')} required>
              <option value="">Select patient</option>
              {PATIENTS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {touched.patient && fieldErrors.patient && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.patient}</p>}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-dollar-sign text-indigo-400 mr-1.5"></i>Amount ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="number" value={form.amount} step="0.01" min="0.01"
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  onBlur={() => handleBlur('amount')} placeholder="0.00"
                  className={inputClass('amount')} required inputMode="decimal" />
                {touched.amount && form.amount && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {fieldErrors.amount ? <i className="fas fa-exclamation-circle text-red-400"></i> : <i className="fas fa-check-circle text-green-400"></i>}
                  </span>
                )}
              </div>
              {touched.amount && fieldErrors.amount && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <i className="fas fa-calendar text-indigo-400 mr-1.5"></i>Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                onBlur={() => handleBlur('date')} className={inputClass('date')} required />
              {touched.date && fieldErrors.date && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.date}</p>}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-credit-card text-indigo-400 mr-1.5"></i>Payment Method <span className="text-red-500">*</span>
            </label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}
              onBlur={() => handleBlur('method')} className={inputClass('method')} required>
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {touched.method && fieldErrors.method && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="fas fa-info-circle"></i> {fieldErrors.method}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <i className="fas fa-circle text-indigo-400 mr-1.5"></i>Status
            </label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              <i className="fas fa-file-invoice mr-1.5"></i> Create Invoice
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
